import {switchOn} from '../utils';
import {add, rectNormalize, rectTranslate} from '../geometry';
import {setPan} from '../actions/viewer';
import {SUBTOOL_TYPES, addAnnotation, updateAnnotation, removeAnnotation} from '../actions/subjectViewer';
import {ControlPointItem, LineItem, RectItem} from './subjectViewerItems';

const PAN_DELTA = 10;

class ToolController {
    constructor(viewer) {
        this.viewer = viewer;
    }

    handleKeyDown() {
    }

    handleKeyUp() {
    }

    handleMouseDown() {
    }

    handleMouseUp() {
    }

    handleMouseMove() {
    }
}

export class PanController extends ToolController {
    constructor(viewer) {
        super(viewer);
        this.panning = false;
    }

    getCursor() {
        if (this.panning) {
            return 'grabbing';
        }
        else {
            return 'grab';
        }
    }

    handleKeyDown(e) {
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
            const pan = add(this.viewer.props.pan, delta);
            this.viewer.props.dispatch(setPan(pan));
        }
    }

    handleMouseDown() {
        this.panning = true;
        this.viewer.addMouseMoveHandler();
    }

    handleMouseUp() {
        this.panning = false;
        this.viewer.removeMouseMoveHandler();
    }

    handleMouseMove(e) {
        let delta;

        switch (this.viewer.props.subTool) {
            case SUBTOOL_TYPES.PAN.ALL:
                delta = this.viewer.getMouseDelta(e);
                break;

            case SUBTOOL_TYPES.PAN.HORIZONTAL:
                delta = this.viewer.getMouseDelta(e, 'horizontal');
                break;
            
            case SUBTOOL_TYPES.PAN.VERTICAL:
                delta = this.viewer.getMouseDelta(e, 'vertical');
                break;
        }

        const pan = add(this.viewer.props.pan, delta);
        this.viewer.props.dispatch(setPan(pan));
    }
}

export class AnnotateController extends ToolController {
    constructor(viewer) {
        super(viewer);
        this.hitItem = null;
        this.panning = false;
        this.currentId = null;
        this.drawingStart = null;
        this.fixedPoint = null;
        this.editPoint = null;
    }

    getCursor() {
        switch (this.viewer.props.subTool) {
            case SUBTOOL_TYPES.ANNOTATE.LINE:
            case SUBTOOL_TYPES.ANNOTATE.RECTANGLE:
                return 'crosshair'
            case SUBTOOL_TYPES.ANNOTATE.MOVE:
                if (this.viewer.hitItem) {
                    return 'grabbing';
                }
                else {
                    return 'grab';
                }
            case SUBTOOL_TYPES.ANNOTATE.EDIT:
                return 'default';
            case SUBTOOL_TYPES.ANNOTATE.DELETE:
                return 'not-allowed';
        }
    }

    handleMouseDown(e) {
        const mousePos = this.viewer.getMousePos(e);

        switchOn(this.viewer.props.subTool, {
            [SUBTOOL_TYPES.ANNOTATE.MOVE]: () => {
                if (this.viewer.hitItem) {
                    this.currentId = this.viewer.hitItem.props.id;
                    this.viewer.addMouseMoveHandler();
                }
            },

            [SUBTOOL_TYPES.ANNOTATE.LINE]: () => {
                this.drawingStart = mousePos;
                this.currentId = this.viewer.props.annotations.nextId;
                this.viewer.addMouseMoveHandler();
                this.viewer.props.dispatch(addAnnotation({kind: 'line', line: [mousePos, mousePos]}));
            },

            [SUBTOOL_TYPES.ANNOTATE.RECTANGLE]: () => {
                this.drawingStart = mousePos;
                this.currentId = this.viewer.props.annotations.nextId;
                this.viewer.addMouseMoveHandler();
                this.viewer.props.dispatch(addAnnotation({kind: 'rectangle', rect: [mousePos, mousePos]}));
            },
            
            [SUBTOOL_TYPES.ANNOTATE.EDIT]: () => {
                if (this.viewer.hitItem instanceof ControlPointItem) {
                    const {id, parentItem} = this.viewer.hitItem.props;
                    this.currentId = parentItem.props.id;
                    
                    if (parentItem instanceof LineItem) {
                        let [p0, p1] = this.viewer.props.annotations.map[this.currentId].line;
                        this.editPoint = (id === 'p0') ? p0 : p1;
                        this.fixedPoint = (id === 'p0') ? p1 : p0;
                    }
                    else if (parentItem instanceof RectItem) {
                        let [tl, br] = this.viewer.props.annotations.map[this.currentId].rect;
                        this.editPoint = (id === 'v0' || id === 'h0') ? tl : br;
                        this.fixedPoint = (id === 'v0' || id === 'h0') ? br : tl;
                    }

                    this.viewer.addMouseMoveHandler();
                }
            },

            [SUBTOOL_TYPES.ANNOTATE.DELETE]: () => {
                if (this.viewer.hitItem) {
                    this.viewer.props.dispatch(removeAnnotation(this.viewer.hitItem.props.id));
                }
            }
        });
    }

    handleMouseUp() {
        this.currentId = null;

        switchOn(this.viewer.props.subTool, {
            [SUBTOOL_TYPES.ANNOTATE.LINE]: () => {
                this.drawingStart = null;
            },

            [SUBTOOL_TYPES.ANNOTATE.RECTANGLE]: () => {
                this.drawingStart = null;
            },

            [SUBTOOL_TYPES.ANNOTATE.EDIT]: () => {
                this.fixedPoint = null;
                this.editPoint = null;
            }
        });

        this.viewer.removeMouseMoveHandler();

    }

    handleMouseMove(e) {
        const mousePos = this.viewer.getMousePos(e);

        switchOn(this.viewer.props.subTool, {
            [SUBTOOL_TYPES.ANNOTATE.MOVE]: () => {
                const delta = this.viewer.getMouseDelta(e);

                if (this.viewer.hitItem instanceof RectItem) {
                    let {rect} = this.viewer.props.annotations.map[this.currentId];
                    rect = rectTranslate(rect, delta);
                    this.viewer.props.dispatch(updateAnnotation(this.currentId, {rect}));
                }
                else if (this.viewer.hitItem instanceof LineItem) {
                    let {line} = this.viewer.props.annotations.map[this.currentId];
                    line = rectTranslate(line, delta);
                    this.viewer.props.dispatch(updateAnnotation(this.currentId, {line}));
                }
            },
            
            [SUBTOOL_TYPES.ANNOTATE.LINE]: () => {
                const line = [this.drawingStart, mousePos];
                this.viewer.props.dispatch(updateAnnotation(this.currentId, {line}));
            },

            [SUBTOOL_TYPES.ANNOTATE.RECTANGLE]: () => {
                const rect = rectNormalize([this.drawingStart, mousePos]);
                this.viewer.props.dispatch(updateAnnotation(this.currentId, {rect}));
            },
            
            [SUBTOOL_TYPES.ANNOTATE.EDIT]: () => {
                const {id, parentItem} = this.viewer.hitItem.props;

                if (parentItem instanceof LineItem) {
                    this.editPoint = mousePos;
                    const line = [this.fixedPoint, this.editPoint];
                    this.viewer.props.dispatch(updateAnnotation(this.currentId, {line}));
                }
                else if (parentItem instanceof RectItem) {
                    const [x, y] = mousePos;
                    let [x1, y1] = this.editPoint;
                    
                    x1 = (id === 'v0' || id === 'v1') ? x : x1;
                    y1 = (id === 'h0' || id === 'h1') ? y : y1;

                    this.editPoint = [x1, y1];
                    const rect = rectNormalize([this.fixedPoint, this.editPoint]);
                    this.viewer.props.dispatch(updateAnnotation(this.currentId, {rect}));
                }
            }
        });
    }
}
