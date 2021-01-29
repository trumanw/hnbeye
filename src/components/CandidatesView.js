import { React, Component } from 'react';
import { Stage } from 'ngl';

class CandidatesView extends Component {
    static VIEW_TYPE = 'candidates'

    constructor(props) {
        super(props);
        this.state = {
            queryParams: null,
            stage: null,
            csvURI: null,
            csv: null, // the attributes of proposed candidates
        };
    }

    componentDidMount = () => {
        this.renderView()
    }

    componentWillUnmount = () => {
        this.state.stage.dispose()
    }

    componentDidUpdate = () => {
        if (this.state.attrs !== null) {
            this.renderView()
        }
    }

    //FIXME: change fsrc to be the hnbs:// global unique uri
    async fetchCSV(fsrc) {
        const csvres = await fetch(fsrc)
        const csvstr = await csvres.text()
        
        this.setState({csv: csvstr})
    }

    prepareArgs = () => {

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

        //' start rendering view
        setTimeout( () => {
            if (that.state.stage !== null && that.state.csv !== null) {
                console.log("render table for proposed candidates.") 
            }
        })
    }

    //TODO: render csv as table with selection checkboxes

}

export default CandidatesView;