/* Based on: 
 * https://github.com/zooniverse/anti-slavery-manuscripts/blob/master/src/ducks/classifications.js
 * https://github.com/zooniverse/anti-slavery-manuscripts/blob/master/LICENSE.txt
*/

import {objectAssign} from '../utils';
import {CLASSIFICATION_TYPES, CLASSIFICATION_STATUS} from '../actions/classification';

const initialState = {
    currentClassification: null,
    status: CLASSIFICATION_STATUS.IDLE,
    error: null
};

function startClassification(action) {
    return objectAssign({}, initialState, {
        currentClassification: action.data,
        status: CLASSIFICATION_STATUS.IDLE,
    });
}

function submitClassification(state) {
    return objectAssign({}, state, {
        status: CLASSIFICATION_STATUS.SENDING
    });
}

function submitClassificationSuccess() {
    return initialState;
}

function submitClassificationError(state, action) {
    return objectAssign({}, state, {
        status: CLASSIFICATION_STATUS.ERROR,
        error: action.error
    });
}

function completeClassification(state, action) {
    const {update} = action;
    const currentClassification = objectAssign({}, state.currentClassification, {
        annotations: update.annotations,
        metadata: objectAssign({}, state.currentClassification.metadata, update.metadata),
    });
    
    return objectAssign({}, state, {currentClassification});
}

export default (state = initialState, action) => {
    switch (action.type) {
        case CLASSIFICATION_TYPES.START_CLASSIFICATION:
            return startClassification(action);

        case CLASSIFICATION_TYPES.SUBMIT_CLASSIFICATION:
            return submitClassification(state);

        case CLASSIFICATION_TYPES.SUBMIT_CLASSIFICATION_SUCCESS:
            return submitClassificationSuccess();

        case CLASSIFICATION_TYPES.SUBMIT_CLASSIFICATION_ERROR:
            return submitClassificationError(state, action);

        case CLASSIFICATION_TYPES.COMPLETE_CLASSIFICATION:
            return completeClassification(state, action);

        default:
            return state;

    }
}
