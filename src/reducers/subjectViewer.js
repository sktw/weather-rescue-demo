import {objectAssign, inheritReducer} from '../utils';
import {VIEWER_TYPES} from '../actions/viewer';
import {SUBJECT_VIEWER_TYPES, TOOL_TYPES, SUBTOOL_TYPES} from '../actions/subjectViewer';
import viewerReducer from './viewer';

function getInitialState() {
    return {
        tool: TOOL_TYPES.PAN,
        subTools: {
            [TOOL_TYPES.ANNOTATE]: SUBTOOL_TYPES.ANNOTATE.MOVE,
            [TOOL_TYPES.PAN]: SUBTOOL_TYPES.PAN.VERTICAL
        },
        highlight: {
            on: false,
            defaultSize: 50,
            size: 50
        },
        annotations: {
            lines: [],
            rectangles: []
        }
    };
}

const HIGHLIGHT_SCALE = 1.0 / 35;

function getHighlightSize(width) {
    // empirically this gives approximately the right highlighter size for a row in the weather report 
    // fitted to the given width

    return Math.round(HIGHLIGHT_SCALE * width);
}

function setTool(state, action) {
    return objectAssign({}, state, {tool: action.tool});
}

function setSubTool(state, action) {
    const subTools = objectAssign({}, state.subTools, {[state.tool]: action.subTool});
    return objectAssign({}, state, {subTools});
}

function setHighlightOn(state, action) {
    const highlight = objectAssign({}, state.highlight, {on: action.on});
    const maintainCentre = action.on; // set viewer flag to maintain centre
    return objectAssign({}, state, {maintainCentre, highlight});
}

function setHighlightSize(state, action) {
    const highlight = objectAssign({}, state.highlight, {size: action.size});
    return objectAssign({}, state, {highlight});
}

function setHighlightDefaultSize(state, action) {
    const [width] = action.size;
    const highlightSize = getHighlightSize(width);
    const highlight = objectAssign({}, state.highlight, {size: highlightSize, defaultSize: highlightSize});
    return objectAssign({}, state, {highlight});
}

function setAnnotations(state, action) {
    return objectAssign({}, state, {annotations: action.annotations});
}

function resetAnnotations(state) {
    return objectAssign({}, state, getInitialState(), {tool: state.tool, subTools: state.subTools, pan: state.pan});
}

function reset(state) {
    const highlight = objectAssign({}, state.highlight, {size: state.highlight.defaultSize});
    return objectAssign({}, state, getInitialState(), {tool: state.tool, subTools: state.subTools, highlight});
}

function reducer(state = getInitialState(), action) {
    switch (action.type) {
        case SUBJECT_VIEWER_TYPES.SET_TOOL:
            return setTool(state, action);
        case SUBJECT_VIEWER_TYPES.SET_SUBTOOL:
            return setSubTool(state, action);
        case SUBJECT_VIEWER_TYPES.SET_HIGHLIGHT_ON:
            return setHighlightOn(state, action);
        case SUBJECT_VIEWER_TYPES.SET_HIGHLIGHT_SIZE:
            return setHighlightSize(state, action);
        case SUBJECT_VIEWER_TYPES.SET_ANNOTATIONS:
            return setAnnotations(state, action);
        case SUBJECT_VIEWER_TYPES.RESET_ANNOTATIONS:
            return resetAnnotations(state);
        case VIEWER_TYPES.SET_VIEWER_SIZE:
            return setHighlightDefaultSize(state, action);
        case VIEWER_TYPES.RESET: 
            return reset(state);
        default:
            return state;
    }
}

export default inheritReducer(viewerReducer, reducer);
