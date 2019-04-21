/* Based on: 
 * https://github.com/zooniverse/anti-slavery-manuscripts/blob/master/src/ducks/workflow.js
 * https://github.com/zooniverse/anti-slavery-manuscripts/blob/master/LICENSE.txt
*/

import apiClient from '../apiClient';
import {randomChoice, createActionTypes} from '../utils';

export const WORKFLOW_TYPES = createActionTypes('workflow', {
    FETCH_WORKFLOW: 'FETCH_WORKFLOW',
    FETCH_WORKFLOW_SUCCESS: 'FETCH_WORKFLOW_SUCCESS',
    FETCH_WORKFLOW_ERROR: 'FETCH_WORKFLOW_ERROR',
    SET_WORKFLOW: 'SET_WORKFLOW',
    FETCH_ACTIVE_WORKFLOWS: 'FETCH_ACTIVE_WORKFLOWS',
    FETCH_ACTIVE_WORKFLOWS_SUCCESS: 'FETCH_ACTIVE_WORKFLOWS_SUCCESS',
    FETCH_ACTIVE_WORKFLOWS_ERROR: 'FETCH_ACTIVE_WORKFLOWS_ERROR'
});

export const WORKFLOW_STATUS = {
  IDLE: 'IDLE',
  FETCHING: 'FETCHING',
  READY: 'READY',
  ERROR: 'ERROR',
};

function fetchWorkflowSuccess(data) {
    return {
        type: WORKFLOW_TYPES.FETCH_WORKFLOW_SUCCESS,
        data
    };
}

function fetchWorkflowError(error) {
    return {
        type: WORKFLOW_TYPES.FETCH_WORKFLOW_ERROR,
        error
    }
}

export function setWorkflow(id) {
    return {
        type: WORKFLOW_TYPES.SET_WORKFLOW,
        id
    };
}

export function selectWorkflow(workflows, func) {
    const id = func(workflows).id;
    return setWorkflow(id);
}

export function selectRandomWorkflow(workflows) {
    return selectWorkflow(workflows, randomChoice);
}

function fetchActiveWorkflowsSuccess(data) {
    return {
        type: WORKFLOW_TYPES.FETCH_ACTIVE_WORKFLOWS_SUCCESS,
        data
    };
}

function fetchActiveWorkflowsError(error) {
    return {
        type: WORKFLOW_TYPES.FETCH_ACTIVE_WORKFLOWS_ERROR,
        error
    }
}

export function fetchWorkflow() {
    return (dispatch, getState) => {
        const {workflow} = getState();
        const id = workflow.currentId;

        dispatch({
            type: WORKFLOW_TYPES.FETCH_WORKFLOW
        });

        // use http_cache=false to force fetching of complete workflow object
        // without, the reduced version from fetchActiveWorkflows is returned

        return apiClient.type('workflows').get(id, {http_cache: false})
            .then(workflow => dispatch(fetchWorkflowSuccess(workflow)))
            .catch(error => dispatch(fetchWorkflowError(error)));

    }
}

export function fetchActiveWorkflows() {
    return (dispatch, getState) => {
        const {project} = getState();
        const id = project.id;

        dispatch({
            type: WORKFLOW_TYPES.FETCH_ACTIVE_WORKFLOWS
        });

        return apiClient.type('workflows').get({
            project_id: id,
            active: true,
            fields: 'display_name'
        })
            .then(workflows => dispatch(fetchActiveWorkflowsSuccess(workflows)))
            .catch(error => dispatch(fetchActiveWorkflowsError(error)));

    }
}
