import { React, Component } from 'react';
import { Stage, Selection, Shape } from 'ngl';

import { INTYPE_COLORS } from '../utils/ConstUtils';

var cartoonRepr
var prevRepr = 1;

class PharModView extends Component {
    static VIEW_TYPE = 'pharmod'

    constructor(props) {
        super(props);
        this.state = {
            queryParams: null,
            stage: null,
            pdbURI: null,  // protein source
            sdfURI: null,  // ligands source
            pdb: null,
            sdf: null,
            pharMods: [],
        };
    }

    componentDidMount = () => {
        this.renderView()
    }

    componentWillUnmount = () => {
        this.state.stage.dispose();
    }

    componentDidUpdate = () => {
        if (this.state.pdb !== null && this.state.sdf !== null) {
            this.renderView()
        }
    }

    createElement = (name, properties, style, id) => {
        var el = document.createElement(name)
        el.id = id
        Object.assign(el, properties)
        Object.assign(el.style, style)
        return el
    }

    addElement = (el) => {
        Object.assign(el.style, {
            position: "absolute",
            zIndex: 10
        })
        this.state.stage.viewer.container.appendChild(el);
    }

    //FIXME: change fsrc to be hnbs:// global unique uri
    async fetchPDB(fsrc) {
        const pdbres = await fetch(fsrc);
        const pdbstr = await pdbres.text();
        const pdbblob = new Blob( [ pdbstr ], { type: 'text/plain'} );

        var pharmo = []
        var pdb_reader_index = 0
        pdbstr.split("\n").forEach(function(l) {
            if (l.startsWith("REMARK     250")) {
                const remark_line = l.slice("REMARK     250 ".length)
                if (remark_line.startsWith("PHARMACOPHORE MODEL WITH IFP-SHAP VALUES")) {
                    pdb_reader_index = 1
                } else {
                    if (1 === pdb_reader_index) {
                        pdb_reader_index = 2
                    } else if (pdb_reader_index > 1) {
                        const phar_model_line = remark_line.split(/\s+/)
                        if (phar_model_line.length > 1) {
                            pharmo.push(phar_model_line.slice(1, ).concat(phar_model_line[0]))
                        } else {
                            pdb_reader_index = 0
                        }
                    }
                }
            }
        })

        this.state.pharMods = pharmo
        this.setState({pdb: pdbblob})
    }

    //FIXME: change fsrc to be hnbs:// global unique uri
    async fetchSDF(fsrc) {
        const sdfres = await fetch(fsrc);
        const sdfstr = await sdfres.text();
        const sdfblob = new Blob( [ sdfstr ], { type: 'text/plain'} );
        this.setState({sdf: sdfblob})
    }

    prepareArgs = () => {
        const qps = this.props.queryParams;

        if (this.state.pdbURI === null) {
            this.setState({pdbURI: qps['pdb']})
            this.fetchPDB(qps['pdb'])
        }

        if (this.state.sdfURI === null) {
            this.setState({sdfURI: qps['sdf']})
            this.fetchSDF(qps['sdf'])
        }
    }

    render() {
        return (
            <div style={{ height: '100vh' }}>
                <div id="viewport" style={{ width: "100%", height: "100%", position: "relative" }} />
            </div>
        )
    }

    renderView = (viewportId="viewport") => {
        const that = this;

        // render the view of the background
        if (this.state.stage !== null) {
            this.state.stage.removeAllComponents()
        } else {
            var stage = new Stage(viewportId);
            stage.setParameters({backgroundColor: "white"})
            stage.viewer.container.addEventListener("dblclick", function() {
                stage.toggleFullScreen();
            });

            // double click to switch to full screen
            function handleResize() {
                stage.handleResize();
            }
            window.addEventListener("orientationchange", handleResize, false);
            window.addEventListener("resize", handleResize, false);
            this.setState({stage: stage});
        }

        that.prepareArgs()

        // start rendering view
        setTimeout( () => {
            if (that.state.stage !== null && 
                that.state.pdb !== null && 
                that.state.sdf !== null) {
                Promise.all([
                    that.state.stage.loadFile(that.state.pdb, {ext: 'pdb'}),
                    that.state.stage.loadFile(that.state.sdf, {ext: "sdf"})
                ]).then(function(ol) {
                    // render protein
                    if (ol[0].structure.atomCount > 0) {
                        console.log("rendering start", that.state.pdb)
                        that.state.stage.getRepresentationsByName("cartoon").dispose()
                        that.renderCartoonOnProtein(ol[0])
                        ol[0].autoView();
                    }

                    // render pharmacophore model with ligands scroller
                    const intype_groups = that.renderPharModViewOnProtein(ol[0])
                    that.renderIFP(ol[0], intype_groups[0], false)
                    that.renderPharModViewOnLigands(ol[0], ol[1], intype_groups[1])
                })
            }
        })
    }

    renderIFP = (protein_component, ifp_groupby_type, default_visible=true) => {
        var interReprMap = {}
        var mesh_offset_top_init = 74
        var mesh_offset_index = 0

        for (var ifp_key in ifp_groupby_type) {
            // render checkbox on stage view
            const res_sele_arr = []
            ifp_groupby_type[ifp_key].forEach(function(item) {
                res_sele_arr.push(item[1] + " AND " + item[2])
            });

            var mesh_checkbox_repr = protein_component.addRepresentation("surface", {
                sele: res_sele_arr.join(" OR "),
                opacity: 0.7,
                surfaceType: "sas",
                colorScheme: "resname",
                contour: true,
                visible: default_visible,
            });

            interReprMap[ifp_key] = mesh_checkbox_repr
            var mesh_checkbox = this.createElement("input", {
                type: "checkbox",
                checked: default_visible,
                onchange: function(e) {
                    if (e.target.id in interReprMap) {
                        interReprMap[e.target.id].setVisibility(e.target.checked)
                    }
                }
            }, {
                top: `${mesh_offset_index*20 + mesh_offset_top_init}px`, 
                left: "12px", 
                color: "black"
            }, ifp_key)
            this.addElement(mesh_checkbox)
            this.addElement(this.createElement("span", {
                innerText: `${ifp_key}`
            }, { 
                top: `${mesh_offset_index*20 + mesh_offset_top_init}px`,
                left: "32px",
                color: "black"
            }, ifp_key));

            mesh_offset_index += 1
        }
    }

    renderPharModViewOnProtein = (protein_component) => {
        const inter_groupby_type = {}
        const inter_groupby_lig = {}
        if (this.state.pharMods !== null) {
            this.state.pharMods.forEach(function(l) {
                const ligno = parseInt(l[7]) - 1
                // const shapval = l[6]
                const intype = l[5]
                const lig_atom = parseInt(l[4]) - 1
                const rgroup = l[3]
                const resno = l[2]
                const res = l[1]
                const res_atom = l[0]

                // show residues involved in any interactions
                protein_component.addRepresentation("line", {sele: resno});

                // generate inter_groupby_type
                if (intype in inter_groupby_type) {
                inter_groupby_type[intype].push(
                    [res_atom, res, resno, rgroup, lig_atom, ligno])
                } else {
                inter_groupby_type[intype] = 
                    [[res_atom, res, resno, rgroup, lig_atom, ligno]]
                }

                // generate inter_groupby_lig
                if (ligno in inter_groupby_lig) {
                inter_groupby_lig[ligno].push(
                    [res_atom, res, resno, rgroup, lig_atom, intype]
                )
                } else {
                inter_groupby_lig[ligno] = 
                    [[res_atom, res, resno, rgroup, lig_atom, intype]]
                }
            }) 
        }

        return [inter_groupby_type, inter_groupby_lig]
    }

    renderPharModViewOnLigands = (protein_component, ligands_component, ifp_groupby_ligno) => {
        const all_ligands_repr_map = {}
        if (ligands_component.structure.modelStore.count > 1) {
            for (let i = 0; i < ligands_component.structure.modelStore.count; i++) {
                // i is your integer
                const ligand_repr = ligands_component.addRepresentation("ball+stick", {
                    sele: "/" + i, 
                    visible: false
                });

                all_ligands_repr_map[i] = [ligand_repr]

                var shape = new Shape("shape", { dashedCylinder: true, disableImpostor: true })
                if (i in ifp_groupby_ligno) {
                    // render interaction as dash lines
                    const protein_ap = protein_component.structure.getAtomProxy()
                    const ligand_ap = ligands_component.structure.getAtomProxy()

                    ifp_groupby_ligno[i].forEach(function(o) {
                        const protein_at_sele = "." + o[0] + " and " + o[2]
                        const ligand_at_sele = "/" + i
                        const sele_at_on_protein = protein_component.structure.getAtomSet(new Selection(protein_at_sele))
                        const sele_at_on_ligand = ligands_component.structure.getAtomSet(new Selection(ligand_at_sele)) 

                        var intype_at_protein = []
                        var intype_at_ligand = []

                        sele_at_on_protein.forEach(function(index) {
                            protein_ap.index = index
                            intype_at_protein = [protein_ap.x, protein_ap.y, protein_ap.z]
                        })

                        sele_at_on_ligand.forEach(function(index, inner_index) {
                            if (inner_index === (o[4]+1)) {
                                ligand_ap.index = index
                                intype_at_ligand = [ligand_ap.x, ligand_ap.y, ligand_ap.z]
                            }
                        })

                        var rgbvars = INTYPE_COLORS[o[5]]
                        var rgbarr = [ rgbvars[0]/255., rgbvars[1]/255., rgbvars[2]/255. ]
                        if (intype_at_protein.length === 3 && intype_at_ligand.length === 3) {
                            shape.addCylinder(intype_at_protein, intype_at_ligand, rgbarr, 0.06, `${o[1]}${o[2]}-${o[4]}@${o[5]}#${o[3]}`)
                        }
                    })
                }
                var shapeComp = this.state.stage.addComponentFromObject(shape)
                var ifpRepr = shapeComp.addRepresentation("buffer", {visible:false})
                all_ligands_repr_map[i].push(ifpRepr)
            }
            this._renderScrollerView(ligands_component.structure.modelStore.count, 0, all_ligands_repr_map)
        } else {
            ligands_component.addRepresentation("ball+stick")
        }
    }

    _renderScrollerView = (ligands_num, offset, ligands_repr_map) => {
        // render scrolling bar for switching ligands
        const ligSwitchSpan = this.createElement("span", {
        innerText: "Representative Ligands"
        }, { top: "12px", left: "12px", color: "lightgrey" }, 'lig-scroller')

        this.addElement(ligSwitchSpan)
        var ligSwitchRange = this.createElement("input", {
            type: "range",
            value: offset,
            min: 0,
            max: ligands_num,
            step: 1
        }, { top: "32px", left: "12px", width:"40%" }, 'lig-scroller')
        ligSwitchRange.oninput = function (e) {
        if (prevRepr !== "0") {
            // o.reprList[prevRepr-1].setVisibility(false)
            ligands_repr_map[prevRepr-1][0].setVisibility(false)
            ligands_repr_map[prevRepr-1][1].setVisibility(false)
        }

        if (e.target.value !== "0") {                
            // o.reprList[e.target.value-1].setVisibility(true)
            ligands_repr_map[e.target.value-1][0].setVisibility(true)
            ligands_repr_map[e.target.value-1][1].setVisibility(true)
        }
        prevRepr = e.target.value
        }
        this.addElement(ligSwitchRange)
    }

    renderCartoonOnProtein  = (o, default_visible=true) => {
        cartoonRepr = o.addRepresentation("cartoon", {
            visible: default_visible
        });
        var cartoonCheckbox = this.createElement("input", {
            type: "checkbox",
            checked: default_visible,
            onchange: function(e) {
                cartoonRepr.setVisibility(e.target.checked)
                }
            },
            { top: "54px", left: "12px"},
            "cartoon-show-chkb"
        )
        this.addElement(cartoonCheckbox)
        this.addElement(this.createElement("span", {
            innerText: "Cartoon"
        }, { top: "54px", left: "32px", color: "black" }))
    }
}

export default PharModView;