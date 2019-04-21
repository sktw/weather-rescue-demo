/* Based on: 
 * https://github.com/zooniverse/anti-slavery-manuscripts/blob/master/src/ducks/project.js
 * https://github.com/zooniverse/anti-slavery-manuscripts/blob/master/LICENSE.txt
*/

import apiClient from '../apiClient';
import {config} from '../config.js';
import {createActionTypes} from '../utils';

export const PROJECT_TYPES = createActionTypes('project', {
    FETCH_PROJECT: 'FETCH_PROJECT',
    FETCH_PROJECT_SUCCESS: 'FETCH_PROJECT_SUCCESS',
    FETCH_PROJECT_ERROR: 'FETCH_PROJECT_ERROR'
});

export const PROJECT_STATUS = {
    IDLE: 'IDLE',
    FETCHING: 'FETCHING',
    READY: 'READY',
    ERROR: 'ERROR',
};

export function fetchProjectSuccess(data) {
    return {
        type: PROJECT_TYPES.FETCH_PROJECT_SUCCESS,
        data
    };
}

export function fetchProjectError(error) {
    return {
        type: PROJECT_TYPES.FETCH_PROJECT_ERROR,
        error
    }
}

export function fetchProject(id = config.zooniverseLinks.projectId) {
    return (dispatch) => {
        dispatch({
            type: PROJECT_TYPES.FETCH_PROJECT, 
            id
        });
        
        return apiClient.type('projects').get(id)
            .then(project => dispatch(fetchProjectSuccess(project)))
            .catch(error => dispatch(fetchProjectError(error)));

    }
}
