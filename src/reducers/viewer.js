import {objectAssign} from '../utils';
import {VIEWER_TYPES} from '../actions/viewer';

function getInitialState() {
    return {
        zoomValue: 'fit-width',
        zoomPercentage: 100,
        rotation: 0,
        error: null
    };
}

function setZoomValue(state, action) {
    return objectAssign({}, state, {zoomValue: action.zoomValue});
}

function setZoomPercentage(state, action) {
    return objectAssign({}, state, {zoomValue: action.zoomValue, zoomPercentage: action.zoomPercentage});
}

function applyRotation(state, action) {
    let rotation = (state.rotation + action.delta + 4) % 4;
    return objectAssign({}, state, {rotation});
}

function setError(state, action) {
    return objectAssign({}, state, {error: action.error});
}

function clearError(state) {
    return objectAssign({}, state, {error: null});
}

function reset(state) {
    return objectAssign({}, state, getInitialState());
}

function reducer(state = getInitialState(), action) {
    switch (action.type) {
        case VIEWER_TYPES.SET_ZOOM_VALUE:
            return setZoomValue(state, action);
        
        case VIEWER_TYPES.SET_ZOOM_PERCENTAGE:
            return setZoomPercentage(state, action);

        case VIEWER_TYPES.APPLY_ROTATION:
            return applyRotation(state, action);

        case VIEWER_TYPES.SET_ERROR:
            return setError(state, action);

        case VIEWER_TYPES.CLEAR_ERROR:
            return clearError(state);

        case VIEWER_TYPES.RESET:
            return reset(state);

        default:
            return state;

    }
}

export default reducer;
