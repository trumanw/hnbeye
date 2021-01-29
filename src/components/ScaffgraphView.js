import { React, Component } from 'react';
import { Stage } from 'ngl';

class ScaffgraphView extends Component {
    static VIEW_TYPE = 'scaffgraph'

    constructor(props) {
        super(props);
        this.state = {
            queryParams: null,
            stage: null,
            jsonURI: null,
            // https://github.com/plotly/react-cytoscapejs
            json: null,
        }
    };

    componentDidMount = () => {
        this.renderView()
    }

    componentWillUnmount = () => {
        this.state.stage.dispose()
    }

    componentDidUpdate = () => {
        if (this.state.json !== null) {
            this.renderView()
        }
    }

    //FIXME: change fsrc to be the hnbs:// global unique uri
    async fetchJSON(fsrc) {
        const jsonres = await fetch(fsrc)
        const json = await jsonres.text()
        this.setState({json: json})
    }

    prepareArgs = () => {
        const qps = this.props.queryParams

        if (this.state.jsonURI === null) {
            this.setState({jsonURI: qps['json']})
            this.fetchJSON(qps['json'])
        }
    }

    render() {
        return (
            <div style={{ height: '100vh' }}>
                <div id="viewport" style={{ width: "100%", height: "100%", position: "relative" }} />
            </div>
        )
    }

    renderView = (viewportId='viewport') => {
        const that = this;

        // render the view of the background
        if (this.state.stage !== null) {
            this.state.stage.removeAllComponents()
        } else {
            var stage = new Stage(viewportId)
            stage.SetParameters({backgroundColor: "white"})
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
                that.state.json !== null) {
                // show scaffold graph
            }
        })
    }
}

export default ScaffgraphView;