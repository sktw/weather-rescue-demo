import {TASK_TYPES, TASK_STATUS} from '../actions/task';
import {VALUE_TYPES} from '../values';
import {objectAssign} from '../utils';
import * as Validators from '../validators';
import * as Transformers from '../transformers';

function getInitialValueState(type) {
    return {
        type,
        value: '',
        focused: false,
        partialErrors: [],
        fullErrors: []
    };
}

function getInitialState() {
    return {
        status: TASK_STATUS.INIT,
        locationTitle: '',
        pressure: getInitialValueState(VALUE_TYPES.PRESSURE),
        dryTemperature: getInitialValueState(VALUE_TYPES.TEMPERATURE),
        wetTemperature: getInitialValueState(VALUE_TYPES.TEMPERATURE),
        maxTemperature: getInitialValueState(VALUE_TYPES.TEMPERATURE),
        minTemperature: getInitialValueState(VALUE_TYPES.TEMPERATURE),
        rainfall: getInitialValueState(VALUE_TYPES.RAINFALL),
        valuesOk: true
    }
}

function setLocationTitle(state, action) {
    const identifier = action.workflow.display_name;
    const index = identifier.indexOf('-');
    let locationTitle = '';

    if (index > -1) {
        locationTitle = identifier.substring(0, index);
    }
    else {
        locationTitle = identifier;
    }

    return objectAssign({}, state, {locationTitle});
}

function nextStep(state) {
    const {status} = state;
    let newStatus = null;

    switch (status) {
        case TASK_STATUS.INIT:
            newStatus = TASK_STATUS.TRANSCRIBE;
            break;

        case TASK_STATUS.TRANSCRIBE:
            newStatus = TASK_STATUS.SUMMARY;
            break;

        case TASK_STATUS.SUMMARY:
            throw new Error('No next step from SUMMARY');
    }

    return objectAssign({}, state, {status: newStatus});
}

function previousStep(state) {
    const {status} = state;
    let newStatus = null;

    switch (status) {
        case TASK_STATUS.INIT:
            throw new Error('No previous step from INIT');
        
        case TASK_STATUS.TRANSCRIBE:
            throw new Error('No previous step from TRANSCRIBE');

        case TASK_STATUS.SUMMARY:
            newStatus = TASK_STATUS.TRANSCRIBE;
            break
    }

    return objectAssign({}, state, {status: newStatus});
}

function getValuesOk(state) {
    return ['pressure', 'dryTemperature', 'wetTemperature', 'maxTemperature', 'minTemperature', 'rainfall'].reduce((ok, name) => ok && state[name].fullErrors.length === 0, true);
}

function beginUpdateValue(state, action) {
    const {name} = action;
    const valueState = state[name];
    const newValueState = objectAssign({}, valueState, {focused: true, partialErrors: valueState.fullErrors});
    return objectAssign({}, state, {[name]: newValueState});
}

function updateValue(state, action) {
    const {name} = action;
    const valueState = state[name];
    const validator = Validators.validators[valueState.type];
    const transformer = Transformers.transformers[valueState.type];
    const value = transformer(action.value);

    const partialErrors = validator.partial(value);
    const fullErrors = validator.full(value);

    const newValueState = objectAssign({}, valueState, {value, partialErrors, fullErrors});
    return objectAssign({}, state, {[name]: newValueState});
}

function endUpdateValue(state, action) {
    const {name} = action;
    const valueState = state[name];
    const newValueState = objectAssign({}, valueState, {focused: false, partialErrors: []});
    return objectAssign({}, state, {[name]: newValueState, valuesOk: getValuesOk(state)});
}

function nextSubject(state) {
    return objectAssign(getInitialState(), {locationTitle: state.locationTitle});
}

function reset() {
    return getInitialState();
}

export default (state = getInitialState(), action) => {
    switch (action.type) {
        case TASK_TYPES.SET_LOCATION_TITLE:
            return setLocationTitle(state, action);
        case TASK_TYPES.BEGIN_UPDATE_VALUE:
            return beginUpdateValue(state, action);
        case TASK_TYPES.UPDATE_VALUE:
            return updateValue(state, action);
        case TASK_TYPES.END_UPDATE_VALUE:
            return endUpdateValue(state, action);
        case TASK_TYPES.NEXT_STEP:
            return nextStep(state);
        case TASK_TYPES.PREVIOUS_STEP:
            return previousStep(state);
        case TASK_TYPES.NEXT_SUBJECT:
            return nextSubject(state);
        case TASK_TYPES.RESET:
            return reset();
        default:
            return state;
    }
}
