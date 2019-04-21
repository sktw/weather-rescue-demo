/* Based on: 
 * https://github.com/zooniverse/anti-slavery-manuscripts/blob/master/src/ducks/workflow.js
 * https://github.com/zooniverse/anti-slavery-manuscripts/blob/master/LICENSE.txt
*/

import {objectAssign} from '../utils';
import {WORKFLOW_TYPES, WORKFLOW_STATUS} from '../actions/workflow';

const initialState = {
    status: WORKFLOW_STATUS.IDLE,
    currentId: '',
    currentWorkflow: null,
    activeWorkflows: [],
    error: null,
};

function fetchWorkflow(state) {
    return objectAssign({}, state, {status: WORKFLOW_STATUS.FETCHING, currentWorkflow: null});
}

function fetchWorkflowSuccess(state, action) {
    return objectAssign({}, state, {status: WORKFLOW_STATUS.READY, currentWorkflow: action.data});
}

function fetchWorkflowError(state, action) {
    return objectAssign({}, state, {status: WORKFLOW_STATUS.ERROR, error: action.error});
}

function setWorkflow(state, action) {
    return objectAssign({}, state, {currentId: action.id});
}

function fetchActiveWorkflows() {
    return objectAssign({}, initialState, {status: WORKFLOW_STATUS.FETCHING});
}

function fetchActiveWorkflowsSuccess(state, action) {
    let activeWorkflows = action.data.map(({id, display_name}) => ({id, displayName: display_name}));

    // TODO - remove filter for 1872+ workflows
    activeWorkflows = activeWorkflows.filter(({displayName}) => /^\w+-3$/.test(displayName));

    return objectAssign({}, state, {status: WORKFLOW_STATUS.READY, activeWorkflows});
}

function fetchActiveWorkflowsError(state, action) {
    return objectAssign({}, state, {status: WORKFLOW_STATUS.ERROR, error: action.error});
}

export default (state = initialState, action) => {
    switch (action.type) {
        case WORKFLOW_TYPES.FETCH_WORKFLOW:
            return fetchWorkflow(state);

        case WORKFLOW_TYPES.FETCH_WORKFLOW_SUCCESS:
            return fetchWorkflowSuccess(state, action);

        case WORKFLOW_TYPES.FETCH_WORKFLOW_ERROR:
            return fetchWorkflowError(state, action);

        case WORKFLOW_TYPES.SET_WORKFLOW:
            return setWorkflow(state, action);

        case WORKFLOW_TYPES.FETCH_ACTIVE_WORKFLOWS:
            return fetchActiveWorkflows(action);

        case WORKFLOW_TYPES.FETCH_ACTIVE_WORKFLOWS_SUCCESS:
            return fetchActiveWorkflowsSuccess(state, action);

        case WORKFLOW_TYPES.FETCH_ACTIVE_WORKFLOWS_ERROR:
            return fetchActiveWorkflowsError(state, action);

        default:
            return state;
    }
};
