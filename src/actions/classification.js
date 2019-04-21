/* Based on: 
 * https://github.com/zooniverse/anti-slavery-manuscripts/blob/master/src/ducks/classifications.js
 * https://github.com/zooniverse/anti-slavery-manuscripts/blob/master/LICENSE.txt
*/

//import apiClient from '../apiClient';
import {createActionTypes, getCurrentDate} from '../utils'; 
import {getSessionId} from '../session';

export const CLASSIFICATION_TYPES = createActionTypes('classification', {
    START_CLASSIFICATION: 'START_CLASSIFICATION',
    SUBMIT_CLASSIFICATION: 'SUBMIT_CLASSIFICATION',
    SUBMIT_CLASSIFICATION_SUCCESS: 'SUBMIT_CLASSIFICATION_SUCCESS',
    SUBMIT_CLASSIFICATION_ERROR: 'SUBMIT_CLASSIFICATION_ERROR',
    COMPLETE_CLASSIFICATION: 'COMPLETE_CLASSIFICATION'
});

export const CLASSIFICATION_STATUS = {
    IDLE: 'IDLE',
    SENDING: 'SENDING',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
};

//const CLASSIFICATIONS_QUEUE_NAME = 'classificationsQueue';

export function startClassification() {
    return (dispatch, getState) => {
        const {project, workflow, subject} = getState();
        const {currentSubject} = subject;
        const {currentWorkflow} = workflow;

        const now = getCurrentDate();

        const data = {
            annotations: [],
            metadata: {
                workflow_version: currentWorkflow.version,
                started_at: now.toISOString(),
                user_agent: navigator.userAgent,
                user_language: 'en', // TODO add localization
                utc_offset: (now.getTimezoneOffset() * 60).toString(),
                subject_dimensions: (currentSubject.locations.map(() => null))
            },
            links: {
                project: project.id,
                workflow: currentWorkflow.id,
                subjects: [currentSubject.id]
            }
        };

        //classification._workflow = workflow.data;
        //classification._subjects = [subject.currentSubject];

        dispatch({
            type: CLASSIFICATION_TYPES.START_CLASSIFICATION,
            data
        });
    };
}

export function completeClassification(annotations) {
    return (dispatch, getState) => {
        const {image} = getState();

        const now = getCurrentDate();
        const update = {
            annotations,
            metadata: {
                session: getSessionId(),
                finished_at: now.toISOString(),
                viewport: {
                    width: window.innerWidth, 
                    height: window.innerHeight
                },
                subject_dimensions: image.imageMetadata
            }
        };
        dispatch({
            type: CLASSIFICATION_TYPES.COMPLETE_CLASSIFICATION,
            update
        });
    };
}

export function submitClassification() {
    // stub for demo

    return (dispatch) => {
        dispatch({
            type: CLASSIFICATION_TYPES.SUBMIT_CLASSIFICATION
        });

        dispatch({
            type: CLASSIFICATION_TYPES.SUBMIT_CLASSIFICATION_SUCCESS
        });

        return Promise.resolve();

        /*
        const classificationObject = apiClient.type('classifications').create(classification.data);
        queueClassification(classificationObject, login.user);
        saveAllQueuedClassifications(login.user);
        */
    }
}


/*
function getQueueName(user) {
    const userId = user ? user.id : '_';
    return userId + '.' + CLASSIFICATIONS_QUEUE_NAME;
}

function queueClassification(classification, user = null) {
    const queueName = getQueueName(user);
    const queue = JSON.parse(localStorage.getItem(queueName)) || [];
    console.log(queue);
    queue.push(classification);
    try {
        localStorage.setItem(queueName, JSON.stringify(queue));
    }
    catch (e) {
        console.error(e);
    }
}

// TODO - decide on error/success handling

function saveAllQueuedClassifications(user = null) {
    const queueName = getQueueName(user);
    const queue = JSON.parse(localStorage.getItem(queueName));

    const newQueue = [];
    localStorage.setItem(queueName, null);

    let itemsFailed = 0;

    return Promise.all(queue.map(classificationData => {
        apiClient.type('classifications').create(classificationData).save()
            .then(classification => {
                classification.destroy();
                return true;
            })
            .catch(error => {
                console.error(error);

                switch (error.status) {
                    case 422: // classification bad, so reject
                        break;

                    default: // retry later TODO - dispatch error to alert user
                        itemsFailed++;
                        newQueue.push(classificationData);
                        break;
                }

                return false;
            });
    }))
    .then(() => {
        if (itemsFailed > 0) {
            console.info('Processed ' + queue.length + ' items, ' + itemsFailed + ' failed');
        }

        localStorage.setItem(queueName, JSON.stringify(newQueue));
    });
}
*/
