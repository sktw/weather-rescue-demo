import {expect} from 'chai';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {objectAssign} from '../src/utils';
import reducer from '../src/reducers/task';
import * as TaskActions from '../src/actions/task';
import {VALUE_TYPES} from '../src/values';
import {ImmutableChecker} from './testUtils';

const checker = new ImmutableChecker();
const storeCreator = configureStore([thunk]);

function getInitialValueState(type) {
    return {
        type,
        value: '',
        focused: false,
        partialErrors: [],
        fullErrors: []
    };
}

const initialState = {
    status: TaskActions.TASK_STATUS.INIT,
    locationTitle: '',
    pressure: getInitialValueState(VALUE_TYPES.PRESSURE),
    dryTemperature: getInitialValueState(VALUE_TYPES.TEMPERATURE),
    wetTemperature: getInitialValueState(VALUE_TYPES.TEMPERATURE),
    maxTemperature: getInitialValueState(VALUE_TYPES.TEMPERATURE),
    minTemperature: getInitialValueState(VALUE_TYPES.TEMPERATURE),
    rainfall: getInitialValueState(VALUE_TYPES.RAINFALL),
    valuesOk: true
};

describe('reducer', () => {
    it('should return initial state', () => {
        expect(reducer(undefined, {})).to.deep.equal(initialState);
    });

    it('should handle SET_LOCATION_TITLE', () => {
        let state = initialState;
        checker.setState(state);

        state = reducer(state, {
            type: TaskActions.TASK_TYPES.SET_LOCATION_TITLE,
            workflow: {
                display_name: 'QUEENSTOWN-1'
            }
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            locationTitle: 'QUEENSTOWN'
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle BEGIN_UPDATE_VALUE', () => {
        let state = objectAssign({}, initialState, {
            pressure: objectAssign(getInitialValueState(VALUE_TYPES.PRESSURE), {
                fullErrors: ['Does not match expected pattern']
            })
        });
        checker.setState(state);

        state = reducer(state, {
            type: TaskActions.TASK_TYPES.BEGIN_UPDATE_VALUE,
            name: 'pressure'
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            pressure: objectAssign(getInitialValueState(VALUE_TYPES.PRESSURE), {
                partialErrors: ['Does not match expected pattern'],
                fullErrors: ['Does not match expected pattern'],
                focused: true
            })
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle UPDATE_VALUE with valid value', () => {
        let state = initialState;
        checker.setState(state);

        state = reducer(state, {
            type: TaskActions.TASK_TYPES.UPDATE_VALUE,
            name: 'dryTemperature',
            value: '5'
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            'dryTemperature': objectAssign(getInitialValueState(VALUE_TYPES.TEMPERATURE), {
                value: '5'
            })
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle UPDATE_VALUE with invalid value', () => {
        let state = initialState;
        checker.setState(state);

        state = reducer(state, {
            type: TaskActions.TASK_TYPES.UPDATE_VALUE,
            name: 'maxTemperature',
            value: '0.'
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            maxTemperature: objectAssign(getInitialValueState(VALUE_TYPES.TEMPERATURE), {
                value: '0.',
                partialErrors: ['Does not match expected pattern'],
                fullErrors: ['Does not match expected pattern'],
            })
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle END_UPDATE_VALUE with all values valid', () => {
        let state = objectAssign({}, initialState, {
            wetTemperature: objectAssign(getInitialValueState(VALUE_TYPES.TEMPERATURE), {
                value: '65',
                focused: true
            }),
            valuesOk: false
        });

        checker.setState(state);

        state = reducer(state, {
            type: TaskActions.TASK_TYPES.END_UPDATE_VALUE,
            name: 'wetTemperature'
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            wetTemperature: objectAssign(getInitialValueState(VALUE_TYPES.TEMPERATURE), {
                focused: false,
                value: '65'
            }),
            valuesOk: true
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle END_UPDATE_VALUE with some values invalid', () => {
        let state = objectAssign({}, initialState, {
            minTemperature: objectAssign(getInitialValueState(VALUE_TYPES.TEMPERATURE), {
                value: '0.',
                partialErrors: ['Does not match expected pattern'],
                fullErrors: ['Does not match expected pattern'],
            })
        });

        checker.setState(state);

        state = reducer(state, {
            type: TaskActions.TASK_TYPES.END_UPDATE_VALUE,
            name: 'minTemperature'
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            minTemperature: objectAssign(getInitialValueState(VALUE_TYPES.TEMPERATURE), {
                focused: false,
                value: '0.',
                fullErrors: ['Does not match expected pattern']
            }),
            valuesOk: false

        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle NEXT_SUBJECT', () => {
        let state = objectAssign({}, initialState, {
            locationTitle: 'BRUSSELS',
            dryTemperature: objectAssign(getInitialValueState(VALUE_TYPES.TEMPERATURE), {
                value: '75'
            }),
            rainfall: objectAssign(getInitialValueState(VALUE_TYPES.RAINFALL), {
                value: '0.34'
            })
        });

        checker.setState(state);

        state = reducer(state, {
            type: TaskActions.TASK_TYPES.NEXT_SUBJECT
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            locationTitle: 'BRUSSELS'
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle RESET', () => {
        let state = objectAssign({}, initialState, {
            locationTitle: 'BRUSSELS',
            wetTemperature: objectAssign(getInitialValueState(VALUE_TYPES.TEMPERATURE), {
                value: '75'
            }),
            rainfall: objectAssign(getInitialValueState(VALUE_TYPES.RAINFALL), {
                value: '0.34'
            })
        });

        checker.setState(state);

        state = reducer(state, {
            type: TaskActions.TASK_TYPES.RESET
        });

        expect(state).to.deep.equal(initialState);

        expect(checker.check()).to.be.true;
    });

    it('should handle NEXT_STEP in INIT status', () => {
        let state = initialState;

        checker.setState(state);

        state = reducer(state, {
            type: TaskActions.TASK_TYPES.NEXT_STEP
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: TaskActions.TASK_STATUS.TRANSCRIBE    
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle NEXT_STEP in TRANSCRIBE status', () => {
        let state = objectAssign({}, initialState, {
            status: TaskActions.TASK_STATUS.TRANSCRIBE,
        });

        checker.setState(state);

        state = reducer(state, {
            type: TaskActions.TASK_TYPES.NEXT_STEP
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: TaskActions.TASK_STATUS.SUMMARY,
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle NEXT_STEP in SUMMARY status', () => {
        let state = objectAssign({}, initialState, {
            status: TaskActions.TASK_STATUS.SUMMARY,
        });

        checker.setState(state);

        expect(() => reducer(state, {
            type: TaskActions.TASK_TYPES.NEXT_STEP
        })).to.throw(Error);

        expect(checker.check()).to.be.true;
    });

    it('should handle PREVIOUS_STEP in INIT status', () => {
        let state = objectAssign({}, initialState, {
            status: TaskActions.TASK_STATUS.INIT,
        });

        checker.setState(state);

        expect(() => reducer(state, {
            type: TaskActions.TASK_TYPES.PREVIOUS_STEP
        })).to.throw(Error);

        expect(checker.check()).to.be.true;
    });

    it('should handle PREVIOUS_STEP in TRANSCRIBE status', () => {
        let state = objectAssign({}, initialState, {
            status: TaskActions.TASK_STATUS.TRANSCRIBE,
        });

        checker.setState(state);

        expect(() => reducer(state, {
            type: TaskActions.TASK_TYPES.PREVIOUS_STEP
        })).to.throw(Error);

        expect(checker.check()).to.be.true;
    });

    it('should handle PREVIOUS_STEP in SUMMARY status', () => {
        let state = objectAssign({}, initialState, {
            status: TaskActions.TASK_STATUS.SUMMARY,
        });

        checker.setState(state);

        state = reducer(state, {
            type: TaskActions.TASK_TYPES.PREVIOUS_STEP
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: TaskActions.TASK_STATUS.TRANSCRIBE,
        }));

        expect(checker.check()).to.be.true;
    });
});

describe('setLocationTitle', () => {
    it('should set the location title', () => {
        const store = storeCreator(initialState);
        store.dispatch(TaskActions.setLocationTitle({
            display_name: 'LYONS-1'
        }));
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: TaskActions.TASK_TYPES.SET_LOCATION_TITLE,
            workflow: {
                display_name: 'LYONS-1'
            }
        });
    });
});

describe('nextStep', () => {
    it('should advance to next step', () => {
        const store = storeCreator(initialState);
        store.dispatch(TaskActions.nextStep());
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: TaskActions.TASK_TYPES.NEXT_STEP
        });
    });
});

describe('previousStep', () => {
    it('should reverse to previous step', () => {
        const store = storeCreator(initialState);
        store.dispatch(TaskActions.previousStep());
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: TaskActions.TASK_TYPES.PREVIOUS_STEP
        });
    });
});

describe('beginUpdateValue', () => {
    it('should begin updating value', () => {
        const store = storeCreator(initialState);
        store.dispatch(TaskActions.beginUpdateValue('rainfall'));
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: TaskActions.TASK_TYPES.BEGIN_UPDATE_VALUE,
            name: 'rainfall'
        });
    });
});

describe('updateValue', () => {
    it('should update value', () => {
        const store = storeCreator(initialState);
        store.dispatch(TaskActions.updateValue('rainfall', '0.'));
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: TaskActions.TASK_TYPES.UPDATE_VALUE,
            name: 'rainfall',
            value: '0.'
        });
    });
});

describe('endUpdateValue', () => {
    it('should end updating value', () => {
        const store = storeCreator(initialState);
        store.dispatch(TaskActions.endUpdateValue('rainfall'));
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: TaskActions.TASK_TYPES.END_UPDATE_VALUE,
            name: 'rainfall'
        });
    });
});

describe('reset', () => {
    it('should reset', () => {
        const store = storeCreator(initialState);
        store.dispatch(TaskActions.reset());
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: TaskActions.TASK_TYPES.RESET
        });
    });
});

describe('nextSubject', () => {
    it('should reset for next subject', () => {
        const store = storeCreator(initialState);
        store.dispatch(TaskActions.nextSubject());
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: TaskActions.TASK_TYPES.NEXT_SUBJECT
        });
    });
});

describe('getAnnotations', () => {
    const task = {
        pressure: {
            value: '29.56'
        },
        wetTemperature: {
            value: '45'
        },
        dryTemperature: {
            value: '50'
        },
        maxTemperature: {
            value: '55'
        },
        minTemperature: {
            value: '40'
        },
        rainfall: {
            value: '-'
        }
    };

    it('should format annotations in expected form', () => {
        const annotations = TaskActions.getAnnotations(task);
        expect(annotations).to.deep.equal([{
            task: 'T3',
            value: [
                {
                    task: 'T7',
                    value: '29.56'
                },
                {
                    task: 'T1',
                    value: '50'
                },
                {
                    task: 'T5',
                    value: '45'
                },
                {
                    task: 'T9',
                    value: '55'
                },
                {
                    task: 'T10',
                    value: '40'
                },
                {
                    task: 'T6',
                    value: '-'
                }
            ]
        }]);
    });
});


