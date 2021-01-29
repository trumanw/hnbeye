import { React, Component } from 'react';
import { parse } from 'url';

import PharModView from './components/PharModView';
import ScaffgraphView from './components/ScaffgraphView';
import ProteinView from './components/ProteinView';
import SankeyView from './components/SankeyView';
import CandidatesView from './components/CandidatesView';
import logo from './logo.svg';
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const query_params_str = window.location && window.location.search ? window.location.search : '';
        const query_params = parse(query_params_str, {parseQueryString: true}).query
        
        if ('type' in query_params) {
            const view_type = query_params['type']
            if (view_type) {
                if (view_type.toLowerCase() === PharModView.VIEW_TYPE) {
                    // e.g. ?pdb=/test/pharmod/5kcv-phar.pdb&sdf=/test/pharmod/5kcv-phar.sdf&type=pharmod
                    return <PharModView queryParams={query_params} />;
                } else if (view_type.toLowerCase() === ScaffgraphView.VIEW_TYPE) {
                    return <ScaffgraphView queryParams={query_params} />;
                } else if (view_type.toLowerCase() === ProteinView.VIEW_TYPE) {
                    return <ProteinView queryParams={query_params} />;
                } else if (view_type.toLowerCase() === SankeyView.VIEW_TYPE) {
                    return <SankeyView queryParams={query_params} />;
                } else if (view_type.toLowerCase() === CandidatesView.VIEW_TYPE) {
                    return <CandidatesView queryParams={query_params} />;
                }
            }
        }

        // no matched view to be rendered
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <p style={{ textAlign: "left" }}>
                        Query parameter `type` shoud be one of : <br/><br/>
                        - <a href="?pdb=/test/pharmod/5kcv-phar.pdb&sdf=/test/pharmod/5kcv-phar.sdf&type=pharmod">
                            <b>pharmod</b>
                          </a>: Pharmacophore model viz. <br/>
                        - <a>
                            <b>candidates</b>
                          </a>: Table view of proposed candidates. <br/>
                        - <a>
                            <b>protein</b>
                          </a>: Protein structure visualization. <br/>
                        - <a>
                            <b>sankey</b>
                          </a>: Sankey plot of data flow. <br/>
                        - <a>
                            <b>scaffgraph</b>
                          </a>: Scaffold graph view. <br/>
                    </p>
                </header>
            </div>
        );
    }
}

export default App;