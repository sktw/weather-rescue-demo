import {createActionTypes} from '../utils';

export const VIEWER_TYPES = createActionTypes('viewer', {
    SET_ZOOM_VALUE: 'SET_ZOOM_VALUE',
    SET_ZOOM_PERCENTAGE: 'SET_ZOOM_PERCENTAGE',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
    APPLY_ROTATION: 'APPLY_ROTATION',
    RESET: 'RESET'
});

export function setZoomValue(zoomValue) {
    return {
        type: VIEWER_TYPES.SET_ZOOM_VALUE,
        zoomValue
    };
}

export function setZoomPercentage(zoomValue, zoomPercentage) {
    return {
        type: VIEWER_TYPES.SET_ZOOM_PERCENTAGE,
        zoomValue,
        zoomPercentage
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

export function reset() {
    return {
        type: VIEWER_TYPES.RESET
    }
}
