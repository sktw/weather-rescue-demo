/* Based on: 
 * https://github.com/zooniverse/anti-slavery-manuscripts/blob/master/src/ducks/project.js
 * https://github.com/zooniverse/anti-slavery-manuscripts/blob/master/LICENSE.txt
*/

import {objectAssign} from '../utils';
import {PROJECT_TYPES, PROJECT_STATUS} from '../actions/project';

const initialState = {
    status: PROJECT_STATUS.IDLE,
    id: '',
    data: null,
    error: null
};

function fetchProject(state, action) {
    return objectAssign({}, state, {status: PROJECT_STATUS.FETCHING, id: action.id, data: null});
}

function fetchProjectSuccess(state, action) {
    return objectAssign({}, state, {status: PROJECT_STATUS.READY, data: action.data});
}

function fetchProjectError(state, action) {
    return objectAssign({}, state, {status: PROJECT_STATUS.ERROR, error: action.error});
}

export default (state = initialState, action) => {
    switch (action.type) {
        case PROJECT_TYPES.FETCH_PROJECT:
            return fetchProject(state, action);

        case PROJECT_TYPES.FETCH_PROJECT_SUCCESS:
            return fetchProjectSuccess(state, action);

        case PROJECT_TYPES.FETCH_PROJECT_ERROR:
            return fetchProjectError(state, action);

        default:
            return state;
    }
};
