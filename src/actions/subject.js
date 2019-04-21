/* Based on: 
 * https://github.com/zooniverse/anti-slavery-manuscripts/blob/master/src/ducks/subject.js
 * https://github.com/zooniverse/anti-slavery-manuscripts/blob/master/LICENSE.txt
*/

import apiClient from '../apiClient';
import {randomChoice, createActionTypes} from '../utils';

export const SUBJECT_TYPES = createActionTypes('subject', {
    FETCH_SUBJECT_QUEUE: 'FETCH_SUBJECT_QUEUE',
    FETCH_SUBJECT_QUEUE_SUCCESS: 'FETCH_SUBJECT_QUEUE_SUCCESS',
    FETCH_SUBJECT_QUEUE_ERROR: 'FETCH_SUBJECT_QUEUE_ERROR',
    SET_SUBJECT_SET: 'SET_SUBJECT_SET',
    NEXT_SUBJECT: 'NEXT_SUBJECT',
    RESET: 'RESET_SUBJECT'
});

export const SUBJECT_STATUS = {
    IDLE: 'IDLE',
    FETCHING: 'FETCHING',
    READY: 'READY',
    ERROR: 'ERROR',
};

export function reset() {
    return {
        type: SUBJECT_TYPES.RESET,
    };
}

export function setSubjectSet(id) {
    return {
        type: SUBJECT_TYPES.SET_SUBJECT_SET,
        id
    };
}

export function selectSubjectSet(subjectSets, func) {
    const id = func(subjectSets);
    return setSubjectSet(id);    
}

export function selectRandomSubjectSet(subjectSets) {
    return selectSubjectSet(subjectSets, randomChoice);
}

function nextSubject() {
    return {
        type: SUBJECT_TYPES.NEXT_SUBJECT
    };
}

export function fetchSubject() {
    return (dispatch, getState) => {
        const {workflow, subject} = getState();

        if (subject.queue.length === 0) {

            const subjectQuery = {workflow_id: workflow.currentId, subject_set_id: subject.subjectSet};

            dispatch({
                type: SUBJECT_TYPES.FETCH_SUBJECT_QUEUE
            });

            return apiClient.type('subjects/queued').get(subjectQuery)
                .then(queue => {
                    dispatch({
                        type: SUBJECT_TYPES.FETCH_SUBJECT_QUEUE_SUCCESS,
                        queue
                    });
                    dispatch(nextSubject());
                }) // TODO filter out already seen and retired
                .catch(error => {
                    dispatch({
                        type: SUBJECT_TYPES.FETCH_SUBJECT_QUEUE_ERROR,
                        error
                    })
                });
        }
        else {
            return Promise.resolve(dispatch(nextSubject()));
        }
    }
}
