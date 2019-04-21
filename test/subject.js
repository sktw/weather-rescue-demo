import {expect} from 'chai';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import subjectReducer from '../src/reducers/subject';
import * as SubjectActions from '../src/actions/subject';
import {ImmutableChecker, mockApiClient} from './testUtils';
import {objectAssign} from '../src/utils';

import subjectsResponse from './data/subjectsResponse';

const checker = new ImmutableChecker();
const storeCreator = configureStore([thunk]);

const initialState = {
    currentSubject: null,
    subjectSet: '',
    status: SubjectActions.SUBJECT_STATUS.IDLE,
    queue: [],
    error: null
};

describe('subjectReducer', () => {
    it('should return initial state', () => {
        expect(subjectReducer(undefined, {})).to.deep.equal(initialState);
    });

    it('should handle SET_SUBJECT_SET', () => {
        let state = objectAssign({}, initialState, {
            currentSubject: subjectsResponse[0],
            subjectSet: '4563',
            status: SubjectActions.SUBJECT_STATUS.READY,
            queue: subjectsResponse
        });

        checker.setState(state);

        state = subjectReducer(state, {
            type: SubjectActions.SUBJECT_TYPES.SET_SUBJECT_SET,
            id: '9438'
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            subjectSet: '9438'
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle FETCH_SUBJECT_QUEUE', () => {
        let state = objectAssign({}, initialState, {
            subjectSet: '9438'
        });

        checker.setState(state);

        state = subjectReducer(state, {
            type: SubjectActions.SUBJECT_TYPES.FETCH_SUBJECT_QUEUE
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: SubjectActions.SUBJECT_STATUS.FETCHING,
            subjectSet: '9438'
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle FETCH_SUBJECT_QUEUE_SUCCESS', () => {
        let state = objectAssign({}, initialState, {
            subjectSet: '9438'
        });

        checker.setState(state);

        state = subjectReducer(state, {
            type: SubjectActions.SUBJECT_TYPES.FETCH_SUBJECT_QUEUE_SUCCESS,
            queue: subjectsResponse
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: SubjectActions.SUBJECT_STATUS.READY,
            subjectSet: '9438',
            queue: subjectsResponse
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle FETCH_SUBJECT_QUEUE_ERROR', () => {
        let state = objectAssign({}, initialState, {
            subjectSet: '9438'
        });

        checker.setState(state);

        state = subjectReducer(state, {
            type: SubjectActions.SUBJECT_TYPES.FETCH_SUBJECT_QUEUE_ERROR,
            error: 'Unable to fetch queue'
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: SubjectActions.SUBJECT_STATUS.ERROR,
            subjectSet: '9438',
            error: 'Unable to fetch queue'
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle RESET', () => {
        let state = {
            status: SubjectActions.SUBJECT_STATUS.ERROR,
            currentSubject: null,
            subjectSet: '9438',
            queue: [],
            error: 'Unable to fetch queue'

        };

        checker.setState(state);

        state = subjectReducer(state, {
            type: SubjectActions.SUBJECT_TYPES.RESET,
        });

        expect(state).to.deep.equal(initialState);

        expect(checker.check()).to.be.true;
    });

    it('should handle NEXT_SUBJECT', () => {
        let state = {
            status: SubjectActions.SUBJECT_STATUS.READY,
            currentSubject: null,
            subjectSet: '9438',
            queue: subjectsResponse,
            error: null
        };

        checker.setState(state);
        const queue = state.queue;

        state = subjectReducer(state, {
            type: SubjectActions.SUBJECT_TYPES.NEXT_SUBJECT
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: SubjectActions.SUBJECT_STATUS.READY,
            currentSubject: queue[0],
            subjectSet: '9438',
            queue: queue.slice(1)
        }));

        expect(checker.check()).to.be.true;
    });
});

describe('selectSubjectSet', () => {
    it('should set set a subject set', () => {
        const store = storeCreator(initialState);
        store.dispatch(SubjectActions.selectSubjectSet(['2342', '4534', '4432'], subjectSets => subjectSets[0]));
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: SubjectActions.SUBJECT_TYPES.SET_SUBJECT_SET,
            id: '2342'
        });
    });
});


describe('fetchSubject', () => {
    it('should dispatch nextSubject when queue is not empty', () => {
        const state = {
            workflow: {
                currentId: '9965'
            },
            subject: objectAssign({}, initialState, {status: SubjectActions.SUBJECT_STATUS.READY, subjectSet: '73385', queue: subjectsResponse})
        };

        const store = storeCreator(state);

        const result = store.dispatch(SubjectActions.fetchSubject());
        return result.then(() => {
            const actions = store.getActions();
            expect(actions).to.have.length(1);
            expect(actions[0]).to.deep.equal({
                type: SubjectActions.SUBJECT_TYPES.NEXT_SUBJECT
            });
        });
    });

    it('should fetch queue successfully when empty', () => {
        const stub = mockApiClient({
            'subjects/queued': {
                get: function() {
                    return Promise.resolve(subjectsResponse);
                }
            }
        });

        const state = {
            workflow: {
                currentId: '9965'
            },
            subject: objectAssign({}, initialState, {status: SubjectActions.SUBJECT_STATUS.READY, subjectSet: '73385'})
        };

        const store = storeCreator(state);

        const result = store.dispatch(SubjectActions.fetchSubject());
        return result.then(() => {
            const actions = store.getActions();
            expect(actions).to.have.length(3);
            expect(actions[0]).to.deep.equal({
                type: SubjectActions.SUBJECT_TYPES.FETCH_SUBJECT_QUEUE
            });
            expect(actions[1]).to.deep.equal({
                type: SubjectActions.SUBJECT_TYPES.FETCH_SUBJECT_QUEUE_SUCCESS,
                queue: subjectsResponse
            });
            expect(actions[2]).to.deep.equal({
                type: SubjectActions.SUBJECT_TYPES.NEXT_SUBJECT
            });

            stub.restore();
 
        });
    });

    it('should raise error when queue fetch unsuccessful', () => {
        const stub = mockApiClient({
            'subjects/queued': {
                get: function() {
                    return Promise.reject('Unable to fetch queue');
                }
            }
        });

        const state = {
            workflow: {
                currentId: '9965'
            },
            subject: objectAssign({}, initialState, {status: SubjectActions.SUBJECT_STATUS.READY, subjectSet: '73385'})
        };

        const store = storeCreator(state);

        const result = store.dispatch(SubjectActions.fetchSubject());
        return result.then(() => {
            const actions = store.getActions();
            expect(actions).to.have.length(2);
            expect(actions[0]).to.deep.equal({
                type: SubjectActions.SUBJECT_TYPES.FETCH_SUBJECT_QUEUE
            });
            expect(actions[1]).to.deep.equal({
                type: SubjectActions.SUBJECT_TYPES.FETCH_SUBJECT_QUEUE_ERROR,
                error: 'Unable to fetch queue'
            });

            stub.restore();
        });
    });
});
