/* Based on: 
 * https://github.com/zooniverse/anti-slavery-manuscripts/blob/master/src/ducks/subject.js
 * https://github.com/zooniverse/anti-slavery-manuscripts/blob/master/LICENSE.txt
*/

import {objectAssign, cloneArray} from '../utils';
import {SUBJECT_TYPES, SUBJECT_STATUS} from '../actions/subject';

const initialState = {
    currentSubject: null,
    subjectSet: '',
    status: SUBJECT_STATUS.IDLE,
    queue: [],
    error: null
};

function fetchSubjectQueue(state) {
    return objectAssign({}, state, {status: SUBJECT_STATUS.FETCHING, currentSubject: null, queue: []});
}

function fetchSubjectQueueSuccess(state, action) {
    return objectAssign({}, state, {status: SUBJECT_STATUS.READY, queue: action.queue});
}

function fetchSubjectQueueError(state, action) {
    return objectAssign({}, state, {status: SUBJECT_STATUS.ERROR, error: action.error});
}

function reset() {
    return initialState;
}

function setSubjectSet(state, action) {
    return objectAssign({}, initialState, {subjectSet: action.id});
}

function nextSubject(state) {
    const queue = cloneArray(state.queue);
    const currentSubject = queue.shift();
    return objectAssign({}, state, {currentSubject, queue});
}

export default (state = initialState, action) => {
    switch (action.type) {
        case SUBJECT_TYPES.FETCH_SUBJECT_QUEUE:
            return fetchSubjectQueue(state);

        case SUBJECT_TYPES.FETCH_SUBJECT_QUEUE_SUCCESS:
            return fetchSubjectQueueSuccess(state, action);

        case SUBJECT_TYPES.FETCH_SUBJECT_QUEUE_ERROR:
            return fetchSubjectQueueError(state, action);

        case SUBJECT_TYPES.RESET:
            return reset();

        case SUBJECT_TYPES.SET_SUBJECT_SET:
            return setSubjectSet(state, action);

        case SUBJECT_TYPES.NEXT_SUBJECT:
            return nextSubject(state);

        default:
            return state;

    }
}
