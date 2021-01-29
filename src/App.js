import { React, Component } from 'react';
import { parse } from 'url';

import PharModView from './components/PharModView';
import logo from './logo.svg';
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const query_params_str = window.location && window.location.search ? window.location.search : '';
        const query_params = parse(query_params_str, {parseQueryString: true}).query
        
        console.log(query_params['type'] === undefined)
        if ('type' in query_params) {
            const view_type = query_params['type']
            if (view_type) {
                if (view_type.toLowerCase() === PharModView.VIEW_TYPE) {
                    return <PharModView queryParams={query_params} />;
                }
            }
        }

        // no matched view to be rendered
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <p style={{ textAlign: "left" }}>
                        Query parameter `type` shoud be : <br/><br/>
                        - pharmod: Pharmacophore model viz <br/>
                        - pdb: Protein viz <br/>
                        - lig: Ligands viz <br/>
                    </p>
                </header>
            </div>
        );
    }
}

export default App;