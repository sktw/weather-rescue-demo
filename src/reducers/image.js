import {objectAssign} from '../utils';
import {IMAGE_TYPES, IMAGE_STATUS} from '../actions/image';

const initialState = {
    status: IMAGE_STATUS.IDLE,
    src: null,
    img: null,
    error: null,
    imageMetadata: null
};

function fetchImage(action) {
    return objectAssign({}, initialState, {status: IMAGE_STATUS.FETCHING, src: action.src, img: null});
}

function fetchImageSuccess(state, action) {
    return objectAssign({}, state, {img: action.img, status: IMAGE_STATUS.READY});
}

function fetchImageError(state, action) {
    return objectAssign({}, state, {status: IMAGE_STATUS.ERROR, error: action.error});
}

function setImageMetadata(state, action) {
    return objectAssign({}, state, {imageMetadata: action.imageMetadata});
}

function reset() {
    return initialState;
}

export default (state = initialState, action) => {
    switch (action.type) {
        case IMAGE_TYPES.FETCH_IMAGE:
            return fetchImage(action);

        case IMAGE_TYPES.FETCH_IMAGE_SUCCESS:
            return fetchImageSuccess(state, action);

        case IMAGE_TYPES.FETCH_IMAGE_ERROR:
            return fetchImageError(state, action);

        case IMAGE_TYPES.SET_IMAGE_METADATA:
            return setImageMetadata(state, action)

        case IMAGE_TYPES.RESET_IMAGE:
                return reset();

        default:
            return state;
    }
}
