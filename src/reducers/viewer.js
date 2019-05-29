import {objectAssign, switchOn} from '../utils';
import {getInverseRotationMatrix, multiplyMatrixVector, scale} from '../geometry';
import {VIEWER_TYPES} from '../actions/viewer';
import {IMAGE_TYPES} from '../actions/image';

function getInitialState() {
    return {
        zoomValue: 'fit-width',
        zoomScale: 1.0,
        rotation: 0,
        pan: [0, 0],
        viewerSize: null,
        imageSize: null,
        error: null,
        maintainCentre: false
    };
}

function getImageDimensions(state) {
    // return image dimensions allowing for rotation

    const {rotation, imageSize} = state;
    const [width, height] = imageSize;
    return (rotation % 2 === 0) ? [width, height] : [height, width];
}

function panToCentre(pan, imageSize, zoomScale, newZoomScale, rotation, newRotation, viewerSize, newViewerSize) {
    if (viewerSize === null) {
        return pan;
    }

    /*
     * Before parameter change (zoomScale, rotation, viewerSize):
     * [X, Y] =  R * S * [x, y] = [w / 2, h / 2] at centre of viewer
     *
     * After parameter change
     * [X', Y'] = R' * S' * [x, y] = [w' / 2, h' / 2]
     *
     * Combining: 
     * R' * S' * S^-1 * R^-1 * [w / 2, h / 2] = [w' / 2, h' / 2]
     * S' * S^-1 * (R^-1 * [w / 2, h / 2]) = (R'^-1 * [w' / 2, h' / 2])
     * S' * S^-1 * u = v
     * 
     * Now
     * S' = [[s', 0, s' * px'], [0, s', s' * py']]
     * S^-1 = [[1 / s, 0, -px], [0, 1 / s, -py]]
     *
     * In component form
     *
     * (s' / s) * ux + s' * (px' - px) = vx
     * (s' / s) * uy + s' * (py' - py) = vy
     *
     * Solving for px', py'
     *
     * px' = px + vx / s' - ux / s
     * py' = py + vy / s' - uy / s
     *
    */

    // Since rotation matrix depends on size of image, need to use rotation matrix for the scaled image

    const inverseRotationMatrix = getInverseRotationMatrix(rotation, scale(imageSize, zoomScale));
    const newInverseRotationMatrix = getInverseRotationMatrix(newRotation, scale(imageSize, newZoomScale));
    const centre = scale(viewerSize, 0.5);
    const newCentre = scale(newViewerSize, 0.5);

    const [ux, uy] = multiplyMatrixVector(inverseRotationMatrix, centre);
    const [vx, vy] = multiplyMatrixVector(newInverseRotationMatrix, newCentre);
    const [px, py] = pan;

    return [
        px + vx / newZoomScale - ux / zoomScale,
        py + vy / newZoomScale - uy / zoomScale
    ];
}

function getNewZoomScale(state) {
    const {zoomScale, zoomValue, imageSize, viewerSize} = state;

    let newZoomScale;

    switchOn(zoomValue, {
        'actual-size': () => {
            newZoomScale = 1.0;
        },

        'fit-height': () => {
            if (imageSize === null || viewerSize === null) {
                newZoomScale = zoomScale;
            }
            else {
                const [width, height] = getImageDimensions(state);
                const [containerWidth, containerHeight] = viewerSize;
                newZoomScale = Math.min(Infinity, containerWidth / width, containerHeight / height);
            }
        },

        'fit-width': () => {
            if (imageSize === null || viewerSize === null) {
                newZoomScale = zoomScale;
            }
            else {
                const [width] = getImageDimensions(state);
                const [containerWidth] = viewerSize;
                newZoomScale = containerWidth / width;
            }
        },

        'default': () => {
            const percentage = parseInt(zoomValue);
            newZoomScale = percentage / 100;
        }
    });

    return newZoomScale;
}


function setZoomValue(state, action) {
    const {zoomScale, viewerSize, pan, imageSize, rotation, maintainCentre} = state;
    const newState = objectAssign({}, state, {zoomValue: action.zoomValue});
    const newZoomScale = getNewZoomScale(newState);

    const newPan = maintainCentre ? panToCentre(pan, imageSize, zoomScale, newZoomScale, rotation, rotation, viewerSize, viewerSize) : pan;

    return objectAssign(newState, {zoomScale: newZoomScale, pan: newPan});
}

function applyRotation(state, action) {
    const {zoomScale, viewerSize, pan, imageSize, rotation, maintainCentre} = state;
    const newRotation = (rotation + action.delta + 4) % 4;
    const newState = objectAssign({}, state, {rotation: newRotation});
    const newZoomScale = getNewZoomScale(newState);

    const newPan = maintainCentre ? panToCentre(pan, imageSize, zoomScale, newZoomScale, rotation, newRotation, viewerSize, viewerSize) : pan;

    return objectAssign(newState, {zoomScale: newZoomScale, pan: newPan});
}

function setPan(state, action) {
    return objectAssign({}, state, {pan: action.pan});
}

function resetPan(state) {
    return objectAssign({}, state, {pan: [0, 0]});
}

function setImageSize(state, action) {
    const {img} = action;
    return objectAssign({}, state, {imageSize: [img.naturalWidth, img.naturalHeight]});
}

function setViewerSize(state, action) {
    const {zoomScale, viewerSize, pan, imageSize, rotation, maintainCentre} = state;
    const newViewerSize = action.size;
    const newState = objectAssign({}, state, {viewerSize: newViewerSize});
    const newZoomScale = getNewZoomScale(newState);
    
    const newPan = maintainCentre ? panToCentre(pan, imageSize, zoomScale, newZoomScale, rotation, rotation, viewerSize, newViewerSize) : pan;

    return objectAssign(newState, {zoomScale: newZoomScale, pan: newPan});
}

function setError(state, action) {
    return objectAssign({}, state, {error: action.error});
}

function clearError(state) {
    return objectAssign({}, state, {error: null});
}

function reset(state) {
    const {imageSize, viewerSize} = state;
    const newState = objectAssign({}, state, getInitialState(), {imageSize, viewerSize});
    const newZoomScale = getNewZoomScale(newState);
    return objectAssign(newState, {zoomScale: newZoomScale});
}

function reducer(state = getInitialState(), action) {
    switch (action.type) {
        case VIEWER_TYPES.SET_ZOOM_VALUE:
            return setZoomValue(state, action);
        
        case VIEWER_TYPES.APPLY_ROTATION:
            return applyRotation(state, action);

        case VIEWER_TYPES.SET_PAN:
            return setPan(state, action);

        case VIEWER_TYPES.RESET_PAN:
            return resetPan(state);

        case VIEWER_TYPES.SET_VIEWER_SIZE:
            return setViewerSize(state, action);

        case IMAGE_TYPES.FETCH_IMAGE_SUCCESS:
            return setImageSize(state, action);

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
