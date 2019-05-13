import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {FullImageItem} from './scene';
import ImageViewer from './ImageViewer';
import Toolbar from './Toolbar';
import {ToolSelector, HighlightControls, Highlighter, AnnotationTools, PanTools} from './subjectViewerTools';
import {switchOn} from '../utils';
import {extendPropTypes} from './componentUtils';
import {add} from '../geometry';
import {TOOL_TYPES, SUBTOOL_TYPES, setPan, setAnnotations, setHighlightSize} from '../actions/subjectViewer';
import {ControlPointItem, LineItem, RectItem} from './subjectViewerItems';

const PAN_DELTA = 10;
const HIGHLIGHT_SCALE = 1.0 / 35;

function getHighlightSize(width) {
    // empirically this gives approximately the right highlighter size for a row in the weather report 
    // fitted to the given width

    return Math.round(HIGHLIGHT_SCALE * width);
}

class ViewerWithTools extends ImageViewer {
    constructor(props) {
        super(props);
        this.dragItem = null;
        this.panning = false;
        this.annotationRectStart = null;
        this.annotationRectEnd = null;
        this.annotationLineItem = null;
        this.annotationRectItem = null;
    }

    renderScene() {
        this.scene.clear();
        this.scene.origin = this.props.pan;
        this.imageItem = new FullImageItem(this.props.img)
        this.scene.addItem(this.imageItem);
        
        this.props.annotations.lines.forEach(([pt0, pt1]) => {
            this.scene.addItem(new LineItem(pt0, pt1, this.props.subTool));
        });

        this.props.annotations.rectangles.forEach(([tl, br]) => {
            this.scene.addItem(new RectItem(tl, br, this.props.subTool));
        });
    }

    setPan() {
        this.props.dispatch(setPan(this.scene.origin));
    }

    setAnnotations() {
        const lines = this.scene.getItems(LineItem).map(item => item.getLine());
        const rectangles = this.scene.getItems(RectItem).map(item => item.getRect());
        this.props.dispatch(setAnnotations({lines, rectangles}));
    }

    componentDidMount() {
        super.componentDidMount();
        // set an initial size for the highlighter based on the width of the viewer
        // TODO handleResize
        // TODO - handle reset - might need a new action setDefaultHightlightSize to set the default size, then fire setHighlightSize to the default
        // reset would then use the default

        const [width] = this.getViewerSize();
        const highlightSize = getHighlightSize(width);
        this.props.dispatch(setHighlightSize(highlightSize));
    }
    
    componentDidUpdate(prevProps) {
        super.componentDidUpdate(prevProps);

        if (this.props.pan !== prevProps.pan ||
            this.props.tool !== prevProps.tool ||
            this.props.subTool !== prevProps.subTool ||
            this.props.annotations !== prevProps.annotations
        ) {
            this.renderScene();
            this.scene.update();
        }
    }

    getCursor() {
        switch (this.props.tool) {
            case TOOL_TYPES.PAN:
                return 'grab';
            case TOOL_TYPES.ANNOTATE:
                switch (this.props.subTool) {
                    case SUBTOOL_TYPES.ANNOTATE.LINE:
                    case SUBTOOL_TYPES.ANNOTATE.RECTANGLE:
                        return 'crosshair'
                    case SUBTOOL_TYPES.ANNOTATE.MOVE:
                        return 'grab';
                    case SUBTOOL_TYPES.ANNOTATE.EDIT:
                        return 'default';
                    case SUBTOOL_TYPES.ANNOTATE.DELETE:
                        return 'not-allowed';
                }
        }
    }

    setCursor(cursor) {
        if (cursor) {
            this.canvasRef.style.cursor = cursor;
        }
        else {
            this.canvasRef.style.cursor = this.getCursor();
        }
    }

    handleKeyDown(e) {
        console.log(e.keyCode);
        let delta = null;

        switch (e.keyCode) {
            case 37:
                delta = [PAN_DELTA, 0];
                break;
            case 38:
                delta = [0, PAN_DELTA];
                break;
            case 39:
                delta = [-PAN_DELTA, 0];
                break
            case 40: 
                delta = [0, -PAN_DELTA];
                break;
        }

        if (delta) {
            e.preventDefault(); // prevent scrolling window
            this.scene.origin = add(this.scene.origin, delta);
            this.scene.update();
        }
    }

    handleKeyUp() {
        this.setPan();
    }

    handleMouseDown(e) {
        const mousePos = this.getMousePos(e);

        switchOn(this.props.tool, {
            [TOOL_TYPES.PAN]: () => {
                this.panning = true;
                this.addMouseMoveHandler();
                this.setCursor('grabbing');
            },
            [TOOL_TYPES.ANNOTATE]: () => switchOn(this.props.subTool, {
                [SUBTOOL_TYPES.ANNOTATE.MOVE]: () => {
                    const item = this.scene.itemAt(mousePos);
                    if (item instanceof LineItem || item instanceof RectItem) {
                        this.dragItem = item;
                        this.addMouseMoveHandler();
                        this.setCursor('grabbing');
                    }
                },

                [SUBTOOL_TYPES.ANNOTATE.LINE]: () => {
                    const lineItem = new LineItem(mousePos, mousePos, SUBTOOL_TYPES.ANNOTATE.LINE);
                    this.scene.addItem(lineItem);
                    this.annotationLineItem = lineItem;
                    this.addMouseMoveHandler();
                },

                [SUBTOOL_TYPES.ANNOTATE.RECTANGLE]: () => {
                    const rectItem = new RectItem(mousePos, mousePos, SUBTOOL_TYPES.ANNOTATE.RECTANGLE);
                    this.scene.addItem(rectItem);
                    this.annotationRectItem = rectItem;
                    this.annotationRectStart = mousePos;
                    this.annotationRectEnd = mousePos
                    this.addMouseMoveHandler();
                },
                
                [SUBTOOL_TYPES.ANNOTATE.EDIT]: () => {
                    const item = this.scene.itemAt(mousePos);
                    if (item instanceof ControlPointItem) {
                        this.dragItem = item;
                        this.addMouseMoveHandler();
                    }
                },

                [SUBTOOL_TYPES.ANNOTATE.DELETE]: () => {
                    const item = this.scene.itemAt(mousePos);
                    if (item instanceof LineItem || item instanceof RectItem) {
                        this.scene.removeItem(item);
                        this.setAnnotations();
                    }
                }
            })
        });
    }

    handleMouseUp() {
        switchOn(this.props.tool, {
            [TOOL_TYPES.PAN]: () => {
                if (this.panning) {
                    this.panning = false;
                    this.removeMouseMoveHandler();
                    this.setCursor();
                    this.setPan();
                }
            },
            [TOOL_TYPES.ANNOTATE]: () => switchOn(this.props.subTool, {
                [SUBTOOL_TYPES.ANNOTATE.MOVE]: () => {
                    if (this.dragItem) {
                        this.dragItem = null;
                        this.removeMouseMoveHandler();
                        this.setCursor();
                        this.setAnnotations();
                    }
                },

                [SUBTOOL_TYPES.ANNOTATE.LINE]: () => {
                    if (this.annotationLineItem) {
                        if (this.annotationLineItem.isEmpty()) { // remove empty lines
                            this.scene.removeItem(this.annotationLineItem);
                        }
                        this.annotationLineItem = null;
                        this.removeMouseMoveHandler();
                        this.setAnnotations();
                    }
                },

                [SUBTOOL_TYPES.ANNOTATE.RECTANGLE]: () => {
                    if (this.annotationRectItem) {
                        if (this.annotationRectItem.isEmpty()) { // remove empty rectangles
                            this.scene.removeItem(this.annotationRectItem);
                        }

                        this.annotationRectStart = null;
                        this.annotationRectEnd = null;
                        this.annotationRectItem = null;
                        this.removeMouseMoveHandler();
                        this.setAnnotations();
                    }
                },

                [SUBTOOL_TYPES.ANNOTATE.EDIT]: () => {
                    if (this.dragItem) {
                        this.dragItem = null;
                        this.removeMouseMoveHandler();
                        this.setAnnotations();
                    }
                }
            })
        });
    }

    handleMouseMove(e) {
        const mousePos = this.getMousePos(e);

        switchOn(this.props.tool, {
            [TOOL_TYPES.PAN]: () => {
                let delta;

                switch (this.props.subTool) {
                    case SUBTOOL_TYPES.PAN.ALL:
                        delta = this.getMouseDelta(e);
                        break;

                    case SUBTOOL_TYPES.PAN.HORIZONTAL:
                        delta = this.getMouseDelta(e, 'horizontal');
                        break;
                    
                    case SUBTOOL_TYPES.PAN.VERTICAL:
                        delta = this.getMouseDelta(e, 'vertical');
                        break;
                }

                this.scene.origin = add(this.scene.origin, delta);
            },
            [TOOL_TYPES.ANNOTATE]: () => switchOn(this.props.subTool, {
                [SUBTOOL_TYPES.ANNOTATE.MOVE]: () => {
                    const delta = this.getMouseDelta(e);
                    this.dragItem.moveBy(delta);
                },
                
                [SUBTOOL_TYPES.ANNOTATE.LINE]: () => {
                    this.annotationLineItem.item1.pos = mousePos;
                },

                [SUBTOOL_TYPES.ANNOTATE.RECTANGLE]: () => {
                    this.annotationRectEnd = mousePos;
                    this.annotationRectItem.setRect([this.annotationRectStart, this.annotationRectEnd]);
                },
                
                [SUBTOOL_TYPES.ANNOTATE.EDIT]: () => {
                    const delta = this.getMouseDelta(e);
                    this.dragItem.moveBy(delta);
                }
            })
        });

        this.scene.update(); // must update scene manually since no action dispatched for move
    }
}

ViewerWithTools.propTypes = extendPropTypes(ImageViewer.propTypes, {
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
        const {tool, subTool, zoomValue, zoomPercentage, rotation, highlight, pan, annotations, img, dispatch} = this.props;

        return (
            <div className="viewer-container">
                <div className="viewer-inner-container">
                    <Toolbar zoomValue={zoomValue} zoomPercentage={zoomPercentage} dispatch={dispatch} >
                        <HighlightControls highlight={highlight} dispatch={dispatch} />
                        <ToolSelector tool={tool} dispatch={dispatch} />
                        {this.renderToolMenu()}
                    </Toolbar>
                    <ViewerWithTools tool={tool} subTool={subTool} pan={pan} img={img} zoomValue={zoomValue} rotation={rotation} annotations={annotations} dispatch={dispatch} >
                        <Highlighter highlight={highlight} />
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
    zoomPercentage: PropTypes.number.isRequired,
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
    const {zoomValue, zoomPercentage, rotation, error, tool, subTools, highlight, pan, annotations} = viewer;
    const {img} = image;

    return {zoomValue, zoomPercentage, rotation, error, tool, subTool: subTools[tool], highlight, pan, annotations, img};
}

export default connect(
    mapStateToProps
)(SubjectViewer);
