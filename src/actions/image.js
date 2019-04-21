import {createActionTypes} from '../utils';

export const IMAGE_TYPES = createActionTypes('image', {
    FETCH_IMAGE: 'FETCH_IMAGE',
    FETCH_IMAGE_SUCCESS: 'FETCH_IMAGE_SUCCESS',
    FETCH_IMAGE_ERROR: 'FETCH_IMAGE_ERROR',
    SET_IMAGE_METADATA: 'SET_IMAGE_METADATA',
    RESET_IMAGE: 'RESET_IMAGE'
});

export const IMAGE_STATUS = {
    IDLE: 'IDLE',
    FETCHING: 'FETCHING',
    READY: 'READY',
    ERROR: 'ERROR',
};

export function setImageMetadata(metadata) {
    return (dispatch) => {
        dispatch({
            type: IMAGE_TYPES.SET_IMAGE_METADATA,
            metadata
        });
    };
}

export function getSrc(subject) {
    return subject.locations[0]['image/jpeg'];
}

export function reset() {
    return {
        type: IMAGE_TYPES.RESET_IMAGE
    }
}

export function fetchImage(subject) {
    return dispatch => {
        const src = getSrc(subject);

        dispatch({
            type: IMAGE_TYPES.FETCH_IMAGE,
            src
        });

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                dispatch({
                    type: IMAGE_TYPES.FETCH_IMAGE_SUCCESS,
                    img
                });

                return resolve();
            };

            img.onerror = (e) => {
                dispatch({
                    type: IMAGE_TYPES.FETCH_IMAGE_ERROR,
                    error: e
                });

                return reject(e);
            };

            img.src = src;
        });
    };
}


