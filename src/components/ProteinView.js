import { React, Component } from 'react';
import { Stage } from 'ngl';

class ProteinView extends Component {
    static VIEW_TYPE = 'protein'

    constructor(props) {
        super(props);
        this.state = {
            queryParams: null,
            stage: null,
            pdbURI: null,
            pdb: null,
            // https://nglviewer.org/ngl/api/manual/usage/selection-language.html
            // a string of something like "ALA101,GLU256,SOL372,DMPC523"
            sele: null,
        };
    }

    componentDidMount = () => {
        this.renderView()
    }

    componentWillUnmount = () => {
        this.state.stage.dispose()
    }

    componentDidUpdate = () => {
        if (this.state.pdb !== null) {
            this.renderView()
        }
    }

    //FIXME: change fsrc to be the hnbs:// global unique uri
    async fetchPDB(fsrc) {
        const pdbres = await fetch(fsrc)
        const pdbstr = await pdbres.text()
        const pdbblob = new Blob( [ pdbstr ], { type: 'text/plain'} )
        this.setState({pdb: pdbblob})
    }

    prepareArgs = () => {
        const qps = this.props.queryParams

        if (this.state.pdbURI === null) {
            this.setState({pdbURI: qps['pdb']})
            this.fetchPDB(qps['pdb'])
        }

        if (this.state.sele === null) {
            this.setState({sele: qps['sele'].split(',').join(' AND ')})
        }
    }

    render() {
        return (
            <div style={{ height: '100vh' }}>
                <div id="viewport" style={{ width: "100%", height: "100%", position: "relative"}} />
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
                that.state.pdb !== null) {
                that.state.stage.loadFile(that.state.pdb, {ext: 'pdb', defaultRepresentation: true })
                    .then(function(o) {
                        o.addRepresentation('licorice', {sele: that.state.sele})
                        o.autoView()
                    })
            }
        })
    }
}

export default ProteinView;