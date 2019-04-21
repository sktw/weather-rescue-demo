import {createActionTypes} from '../utils';

export const TASK_TYPES = createActionTypes('task', {
    SET_LOCATION_TITLE: 'SET_LOCATION_TITLE',
    BEGIN_UPDATE_VALUE: 'BEGIN_UPDATE_VALUE',
    UPDATE_VALUE: 'UPDATE_VALUE',
    END_UPDATE_VALUE: 'END_UPDATE_VALUE',
    NEXT_STEP: 'NEXT_STEP',
    PREVIOUS_STEP: 'PREVIOUS_STEP',
    NEXT_SUBJECT: 'NEXT_SUBJECT',
    RESET: 'RESET'
});

export const TASK_STATUS = {
    INIT: 'INIT',
    TRANSCRIBE: 'TRANSCRIBE',
    SUMMARY: 'SUMMARY'
};

export function setLocationTitle(workflow) {
    return {
        type: TASK_TYPES.SET_LOCATION_TITLE,
        workflow
    };
}

export function nextStep() {
    return {
        type: TASK_TYPES.NEXT_STEP
    };
}

export function previousStep() {
    return {
        type: TASK_TYPES.PREVIOUS_STEP
    };
}

export function beginUpdateValue(name) {
    return {
        type: TASK_TYPES.BEGIN_UPDATE_VALUE,
        name
    };
}

export function updateValue(name, value) {
    return {
        type: TASK_TYPES.UPDATE_VALUE,
        name,
        value,
    };
}

export function endUpdateValue(name) {
    return {
        type: TASK_TYPES.END_UPDATE_VALUE,
        name
    };
}

export function reset() {
    return {
        type: TASK_TYPES.RESET
    };
}

export function nextSubject() {
    return {
        type: TASK_TYPES.NEXT_SUBJECT
    };
}

export function getAnnotations(task) {
    return [{
        task: 'T3',
        value: [
            {
                task: 'T7',
                value: task.pressure.value
            },
            {
                task: 'T1',
                value: task.dryTemperature.value
            },
            {
                task: 'T5',
                value: task.wetTemperature.value
            },
            {
                task: 'T9',
                value: task.maxTemperature.value
            },
            {
                task: 'T10',
                value: task.minTemperature.value
            },
            {
                task: 'T6',
                value: task.rainfall.value
            }
        ]
    }];
}
