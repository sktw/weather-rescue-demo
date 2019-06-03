import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import ImageViewer from './ImageViewer';
import Toolbar from './Toolbar';
import {ToolSelector, Highlighter, AnnotationTools, PanTools} from './subjectViewerTools';
import {extendPropTypes} from './componentUtils';
import {TOOL_TYPES, SUBTOOL_TYPES} from '../actions/subjectViewer';
import {LineItem, RectItem} from './subjectViewerItems';
import {PanController, AnnotateController} from './subjectViewerToolControllers';

class ViewerWithTools extends ImageViewer {
    constructor(props) {
        super(props);
        this.toolControllers = {
            [TOOL_TYPES.PAN]: new PanController(this),
            [TOOL_TYPES.ANNOTATE]: new AnnotateController(this)
        };
        this.state = {mouseDown: false};
        this.handleHit = this.handleHit.bind(this);
    }

    renderView() {
        const {zoomScale, subTool, annotations} = this.props;
        const showControlPoints = (subTool === SUBTOOL_TYPES.ANNOTATE.EDIT);
 
        return (
            <g>
                {Object.keys(annotations.map).map(id => {
                    const annotation = annotations.map[id];
                    switch (annotation.kind) {
                        case 'line':
                            return (
                                <LineItem 
                                    key={id} 
                                    id={id} 
                                    line={annotation.line} 
                                    zoomScale={zoomScale} 
                                    onHit={this.handleHit} 
                                    showControlPoints={showControlPoints} 
                                />
                            );
                        case 'rectangle':
                            return (
                                <RectItem 
                                    key={id} 
                                    id={id} 
                                    rect={annotation.rect} 
                                    zoomScale={zoomScale} 
                                    onHit={this.handleHit} 
                                    showControlPoints={showControlPoints}
                                />
                            );
                    }
                })}
            </g>
        );
    }

    componentDidUpdate() {
        this.viewerRef.style.cursor = this.getCursor();
    }

    getCursor() {
        return this.toolControllers[this.props.tool].getCursor();
    }

    handleHit(obj) {
        this.hitItem = obj;
    }

    handleKeyDown(e) {
        return this.toolControllers[this.props.tool].handleKeyDown(e);
    }

    handleKeyUp(e) {
        return this.toolControllers[this.props.tool].handleKeyUp(e);
    }

    handleMouseDown(e) {
        e.preventDefault();
        const result = this.toolControllers[this.props.tool].handleMouseDown(e);
        this.setState({mouseDown: true}); // force re-render to apply any cursor change
        return result;
    }
    
    handleMouseUp(e) {
        this.hitItem = null;
        const result = this.toolControllers[this.props.tool].handleMouseUp(e);
        this.setState({mouseDown: false}); // force re-render to apply any cursor change
        return result;
    }

    handleMouseMove(e) {
        return this.toolControllers[this.props.tool].handleMouseMove(e);
    }
}

ViewerWithTools.propTypes = extendPropTypes(ImageViewer.propTypes, {
    img: PropTypes.instanceOf(Element).isRequired,
    tool: PropTypes.string.isRequired,
    subTool: PropTypes.string.isRequired,
    pan: PropTypes.arrayOf(PropTypes.number).isRequired,
    annotations: PropTypes.object.isRequired
});

class SubjectViewer extends React.Component {
    renderToolMenu() {
        const {tool, subTool, dispatch} = this.props;

        switch (tool) {
            case TOOL_TYPES.PAN:
                return <PanTools subTool={subTool} dispatch={dispatch} />;

            case TOOL_TYPES.ANNOTATE:
                return <AnnotationTools subTool={subTool} dispatch={dispatch} />;
        }
    }

    render() {
        const {tool, subTool, zoomValue, zoomScale, imageSize, rotation, highlight, pan, annotations, img, dispatch} = this.props;

        return (
            <div className="viewer-container">
                <div className="viewer-inner-container">
                    <Toolbar zoomValue={zoomValue} zoomScale={zoomScale} highlight={highlight} dispatch={dispatch} >
                        <ToolSelector tool={tool} dispatch={dispatch} />
                        {this.renderToolMenu()}
                    </Toolbar>
                    <ViewerWithTools tool={tool} subTool={subTool} pan={pan} imageSize={imageSize} zoomScale={zoomScale} rotation={rotation} annotations={annotations} img={img} dispatch={dispatch} >
                        <Highlighter rotation={rotation} highlight={highlight} />
                    </ViewerWithTools>
                </div>
            </div>
        );
    }
}

SubjectViewer.propTypes = {
    tool: PropTypes.string.isRequired,
    subTool: PropTypes.string,
    zoomValue: PropTypes.string.isRequired,
    zoomScale: PropTypes.number.isRequired,
    imageSize: PropTypes.arrayOf(PropTypes.number).isRequired,
    rotation: PropTypes.number.isRequired,
    error: PropTypes.string,
    highlight: PropTypes.object.isRequired,
    pan: PropTypes.arrayOf(PropTypes.number).isRequired,
    annotations: PropTypes.object.isRequired,
    img: PropTypes.instanceOf(Element).isRequired,
    dispatch: PropTypes.func.isRequired,
};


function mapStateToProps(storeState) {
    const {viewer, image} = storeState;
    const {zoomValue, zoomScale, imageSize, rotation, error, tool, subTools, highlight, pan, annotations} = viewer;
    const {img} = image;

    return {zoomValue, zoomScale, imageSize, rotation, error, tool, subTool: subTools[tool], highlight, pan, annotations, img};
}

export default connect(
    mapStateToProps
)(SubjectViewer);
