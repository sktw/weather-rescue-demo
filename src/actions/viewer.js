import {createActionTypes} from '../utils';

export const VIEWER_TYPES = createActionTypes('viewer', {
    SET_ZOOM_VALUE: 'SET_ZOOM_VALUE',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
    APPLY_ROTATION: 'APPLY_ROTATION',
    SET_VIEWER_SIZE: 'SET_VIEWER_SIZE',
    SET_PAN: 'SET_PAN',
    RESET_PAN: 'RESET_PAN',
    RESET: 'RESET'
});

export function setZoomValue(zoomValue) {
    return {
        type: VIEWER_TYPES.SET_ZOOM_VALUE,
        zoomValue
    };
}

export function setError(error) {
    return {
        type: VIEWER_TYPES.SET_ERROR,
        error
    };
}

export function clearError() {
    return {
        type: VIEWER_TYPES.CLEAR_ERROR,
    };
}

export function applyRotation(delta) {
    return {
        type: VIEWER_TYPES.APPLY_ROTATION,
        delta
    }
}

export function setPan(pan) {
    return {
        type: VIEWER_TYPES.SET_PAN,
        pan
    };
}

export function resetPan() {
    return {
        type: VIEWER_TYPES.RESET_PAN
    };
}

export function setViewerSize(size) {
    return {
        type: VIEWER_TYPES.SET_VIEWER_SIZE,
        size
    };
}

export function reset() {
    return {
        type: VIEWER_TYPES.RESET
    }
}
