import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Item, FullImageItem} from './scene';
import ImageViewer from './ImageViewer';
import Toolbar from './Toolbar';
import {MenuButton, ToolButton, ButtonGroup, ToolButtonContainer} from './DrawingTools';
import {switchOn} from '../utils';
import {extendPropTypes} from './componentUtils';
import {add, subtract, equal, rectSize, rectMidpoints, rectNormalize, rectContainsPoint, rectExpand, rectTranslate} from '../geometry';
import {TOOL_TYPES, SUBTOOL_TYPES, setTool, setSubTool, setPan, setAnnotations, resetAnnotations, resetPan} from '../actions/subjectViewer';

const HIT_TOLERENCE = 5;
const PAN_DELTA = 10;

class SubjectViewerTools extends React.Component {
    constructor(props) {
        super(props);
        this.handleToolChange = this.handleToolChange.bind(this);
    }

    render() {
        const {tool} = this.props;
        return (
            <ButtonGroup>
                <ToolButtonContainer tool={tool} onChange={this.handleToolChange}>
                    <ToolButton title="Pan" value={TOOL_TYPES.PAN} />
                    <ToolButton title="Annotate" value={TOOL_TYPES.ANNOTATE} />
                </ToolButtonContainer>
            </ButtonGroup>
        );
    }

    handleToolChange(tool) {
        this.props.dispatch(setTool(tool));
    }
}

SubjectViewerTools.propTypes = {
    tool: PropTypes.string.isRequired,
    dispatch:  PropTypes.func.isRequired
};

class AnnotationTools extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubToolChange = this.handleSubToolChange.bind(this);
        this.handleClearAnnotations = this.handleClearAnnotations.bind(this);
    }

    render() {
        const subTools = SUBTOOL_TYPES.ANNOTATE;
        const {subTool} = this.props;

        return (
            <ButtonGroup>
                <ToolButtonContainer tool={subTool} onChange={this.handleSubToolChange}>
                    <ToolButton title="Line" value={subTools.LINE} iconClass="fa-pencil" />
                    <ToolButton title="Rectangle" value={subTools.RECTANGLE} iconClass="fa-square-o" />
                    <ToolButton title="Move" value={subTools.MOVE} iconClass="fa-arrows" />
                    <ToolButton title="Edit" value={subTools.EDIT} iconClass="fa-mouse-pointer" />
                    <ToolButton title="Delete" value={subTools.DELETE} iconClass="fa-remove" />
                </ToolButtonContainer>
                <MenuButton title="Clear annotations" onClick={this.handleClearAnnotations} iconClass="fa-trash" />
           </ButtonGroup>
        );
    }

    handleSubToolChange(subTool) {
        this.props.dispatch(setSubTool(subTool));
    }

    handleClearAnnotations() {
        this.props.dispatch(resetAnnotations());
    }
}

AnnotationTools.propTypes = {
    subTool: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired
};

class PanTools extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubToolChange = this.handleSubToolChange.bind(this);
        this.handleResetPan = this.handleResetPan.bind(this);
    }

    render() {
        const subTools = SUBTOOL_TYPES.PAN;
        const {subTool} = this.props;

        return (
            <ButtonGroup>
                <ToolButtonContainer tool={subTool} onChange={this.handleSubToolChange}>
                    <ToolButton title="All" value={subTools.ALL} iconClass="fa-arrows" />
                    <ToolButton title="Vertical" value={subTools.VERTICAL} iconClass="fa-arrows-v" />
                    <ToolButton title="Horizontal" value={subTools.HORIZONTAL} iconClass="fa-arrows-h" />
                </ToolButtonContainer>
                <MenuButton title="Reset pan" onClick={this.handleResetPan} iconClass="fa-bullseye" />
            </ButtonGroup>
        );
    }

    handleSubToolChange(subTool) {
        this.props.dispatch(setSubTool(subTool));
    }

    handleResetPan() {
        this.props.dispatch(resetPan());
    }
}

PanTools.propTypes = {
    subTool: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired
};


class ControlPointItem extends Item {
    constructor(parnt, pos) {
        super(parnt);
        this.pos = pos;
        this.zIndex = 2;
    }

    draw(ctx) {
        const pos = this.scene.toScene(this.pos);
        const r = 4;
        ctx.save();
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(pos[0] - r, pos[1] - r, 2 * r, 2 * r);
        ctx.stroke();
        ctx.restore()
    }

    moveBy(delta) {
        this.parnt.moveControlPointBy(this, delta);
    }

    hitTest(pt) {
        const r = 4;
        const rect = rectExpand([this.pos, this.pos], [r + HIT_TOLERENCE, r + HIT_TOLERENCE]);
        return rectContainsPoint(rect, pt);
    }
}

class LineItem extends Item {
    constructor(pt0, pt1, subTool) {
        super();

        this.item0 = new ControlPointItem(this, pt0);
        this.item1 = new ControlPointItem(this, pt1);

        this.children = [this.item0, this.item1];

        switch (subTool) {
            case SUBTOOL_TYPES.ANNOTATE.EDIT:
                this.showControlPoints(true);
                break;
            default:
                this.showControlPoints(false);
        }

        this.zIndex = 1;
    }

    showControlPoints(sense) {
        this.children.forEach(item => item.setVisible(sense));
    }

    isEmpty() {
        return equal(this.item0.pos, this.item1.pos);
    }

    getLine() {
        return [this.item0.pos, this.item1.pos];
    }

    moveBy(delta) {
        this.children.forEach(item => item.pos = add(item.pos, delta));
    }

    draw(ctx) {
        const [x0, y0] = this.scene.toScene(this.item0.pos);
        const [x1, y1] = this.scene.toScene(this.item1.pos);

        ctx.save();
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.restore()
    }

    moveControlPointBy(item, delta) {
        item.pos = add(item.pos, delta);
    }

    hitTest(pt) {
        // take item0 as origin, shift pt and item1
        const [x1, y1] = subtract(this.item1.pos, this.item0.pos);
        const [x2, y2] = subtract(pt, this.item0.pos);

        // compute rotation parameters

        const l = Math.sqrt(x1 * x1 + y1 * y1);
        const c = x1 / l;
        const s = y1 / l;

        // under rotation, item1 is moved to x-axis
        // compute location of pt under same rotation

        const x3 = c * x2 + s * y2;
        const y3 = -s * x2 + c * y2;

        // test rectangle along x-axis of width l and height 0, expanded by HIT_TOLERENCE

        const rect = rectExpand([[0, 0], [l, 0]], [HIT_TOLERENCE, HIT_TOLERENCE]);
        return rectContainsPoint(rect, [x3, y3]);
    }
}



class RectItem extends Item {
    constructor(tl, br, subTool) {
        super();
        this.rect = [tl, br];
        const midpoints = rectMidpoints(this.rect);

        this.tItem =  new ControlPointItem(this, midpoints[0]);
        this.bItem = new ControlPointItem(this, midpoints[1]);
        this.lItem = new ControlPointItem(this, midpoints[2]);
        this.rItem = new ControlPointItem(this, midpoints[3]);

        this.children = [this.tItem, this.bItem, this.lItem, this.rItem];

        switch (subTool) {
            case SUBTOOL_TYPES.ANNOTATE.EDIT:
                this.showControlPoints(true);
                break;
            default:
                this.showControlPoints(false);
        }

        this.zIndex = 1;
    }

    showControlPoints(sense) {
        this.children.forEach(item => item.setVisible(sense));
    }

    isEmpty() {
        const [tl, br] = this.rect;
        return equal(tl, br);
    }

    getRect() {
        return this.rect;
    }

    setRect(rect) {
        this.rect = rectNormalize(rect);
        const midpoints = rectMidpoints(this.rect);

        this.tItem.pos = midpoints[0];
        this.bItem.pos = midpoints[1];
        this.lItem.pos = midpoints[2];
        this.rItem.pos = midpoints[3];
   }

    moveBy(delta) {
        this.rect = rectTranslate(this.rect, delta);
        this.children.forEach(item => item.pos = add(item.pos, delta));
    }

    draw(ctx) {
        const [tl] = this.rect;
        const [x0, y0] = this.scene.toScene(tl);
        const [w, h] = this.scene.sizeToScene(rectSize(this.rect));

        ctx.save();
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(x0, y0, w, h);
        ctx.stroke();
        ctx.restore()
    }

    moveControlPointBy(item, delta) {
        const [dx, dy] = delta;

        if (item === this.lItem || item === this.rItem) {
            item.pos = add(item.pos, [dx, 0]); 
        }
        else {
            item.pos = add(item.pos, [0, dy]); 
        }

        const x0 = this.lItem.pos[0];
        const x1 = this.rItem.pos[0];
        const y0 = this.tItem.pos[1];
        const y1 = this.bItem.pos[1];

        if (x0 > x1) {
            const temp = this.lItem;
            this.lItem = this.rItem;
            this.rItem = temp;
        }

        if (y0 > y1) {
            const temp = this.tItem;
            this.tItem = this.bItem;
            this.bItem = temp;
        }

        this.setRect([[x0, y0], [x1, y1]]);
    }

    hitTest(pt) {
        const outer = rectExpand(this.rect, [HIT_TOLERENCE, HIT_TOLERENCE]);
        const inner = rectExpand(this.rect, [-HIT_TOLERENCE, -HIT_TOLERENCE]);
        return rectContainsPoint(outer, pt) && !rectContainsPoint(inner, pt);
    }
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
    renderSubTools() {
        const {tool, subTool, dispatch} = this.props;

        switch (tool) {
            case TOOL_TYPES.PAN:
                return <PanTools subTool={subTool} dispatch={dispatch} />;

            case TOOL_TYPES.ANNOTATE:
                return <AnnotationTools subTool={subTool} dispatch={dispatch} />;
        }
    }

    render() {
        const {tool, subTool, zoomValue, zoomPercentage, rotation, pan, annotations, img, dispatch} = this.props;

        return (
            <div className="viewer-container">
                <div className="viewer-inner-container">
                    <Toolbar zoomValue={zoomValue} zoomPercentage={zoomPercentage} dispatch={dispatch} >
                        <SubjectViewerTools tool={tool} dispatch={dispatch} />
                        {this.renderSubTools()}
                    </Toolbar>
                    <ViewerWithTools tool={tool} subTool={subTool} pan={pan} img={img} zoomValue={zoomValue} rotation={rotation} annotations={annotations} dispatch={dispatch} />
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
    pan: PropTypes.arrayOf(PropTypes.number).isRequired,
    annotations: PropTypes.object.isRequired,
    img: PropTypes.instanceOf(Element).isRequired,
    dispatch: PropTypes.func.isRequired,
};


function mapStateToProps(storeState) {
    const {viewer, image} = storeState;
    const {zoomValue, zoomPercentage, rotation, error, tool, subTools, pan, annotations} = viewer;
    const {img} = image;

    return {zoomValue, zoomPercentage, rotation, error, tool, subTool: subTools[tool], pan, annotations, img};
}

export default connect(
    mapStateToProps
)(SubjectViewer);
