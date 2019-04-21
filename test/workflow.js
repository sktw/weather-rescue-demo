import {expect} from 'chai';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import workflowReducer from '../src/reducers/workflow';
import * as WorkflowActions from '../src/actions/workflow';
import {ImmutableChecker, getChainActions, mockApiClient} from './testUtils';
import {objectAssign} from '../src/utils';
import activeWorkflowsResponse from './data/activeWorkflowsResponse';
import workflowsResponseAberdeen from './data/workflowsResponseAberdeen';

const checker = new ImmutableChecker();
const storeCreator = configureStore([thunk]);

const chainActions = getChainActions(workflowReducer);

const initialState = {
    status: WorkflowActions.WORKFLOW_STATUS.IDLE,
    currentId: '',
    currentWorkflow: null,
    activeWorkflows: [],
    error: null,
};

describe('workflowReducer', () => {
    it('should return initial state', () => {
        expect(workflowReducer(undefined, {})).to.deep.equal(initialState);
    });

    it('should handle SET_WORKFLOW', () => {
        let state = initialState;
        checker.setState(state);

        state = workflowReducer(state, {
            type: WorkflowActions.WORKFLOW_TYPES.SET_WORKFLOW, 
            id: '4345'
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            currentId: '4345'
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle FETCH_WORKFLOW', () => {
        let state = objectAssign({}, initialState, {
            currentId: '9965'
        });

        checker.setState(state);

        state = workflowReducer(state, {
            type: WorkflowActions.WORKFLOW_TYPES.FETCH_WORKFLOW
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: WorkflowActions.WORKFLOW_STATUS.FETCHING,
            currentId: '9965'
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle FETCH_WORKFLOW_SUCCESS', () => {
        let state = objectAssign({}, initialState, {
            status: WorkflowActions.WORKFLOW_STATUS.FETCHING,
            currentId: '9965'
        });

        checker.setState(state);

        state = workflowReducer(state, {
            type: WorkflowActions.WORKFLOW_TYPES.FETCH_WORKFLOW_SUCCESS,
            data: workflowsResponseAberdeen
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: WorkflowActions.WORKFLOW_STATUS.READY,
            currentId: '9965',
            currentWorkflow: workflowsResponseAberdeen
        }));

        expect(checker.check()).to.be.true;
    });


    it('should handle FETCH_WORKFLOW_ERROR', () => {
        let state = objectAssign({}, initialState, {
            status: WorkflowActions.WORKFLOW_STATUS.FETCHING,
            currentId: '9965'
        });

        checker.setState(state);

        state = workflowReducer(state, {
            type: WorkflowActions.WORKFLOW_TYPES.FETCH_WORKFLOW_ERROR,
            error: 'Unable to fetch workflow'
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: WorkflowActions.WORKFLOW_STATUS.ERROR,
            currentId: '9965',
            error: 'Unable to fetch workflow',
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle FETCH_ACTIVE_WORKFLOWS', () => {
        let state = initialState;

        checker.setState(state);

        state = workflowReducer(state, {
            type: WorkflowActions.WORKFLOW_TYPES.FETCH_ACTIVE_WORKFLOWS
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: WorkflowActions.WORKFLOW_STATUS.FETCHING
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle FETCH_ACTIVE_WORKFLOWS_SUCCESS', () => {
        let state = objectAssign({}, initialState, {
            status: WorkflowActions.WORKFLOW_STATUS.FETCHING
        });

        checker.setState(state);

        state = workflowReducer(state, {
            type: WorkflowActions.WORKFLOW_TYPES.FETCH_ACTIVE_WORKFLOWS_SUCCESS,
            data: activeWorkflowsResponse
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: WorkflowActions.WORKFLOW_STATUS.READY,
            activeWorkflows: activeWorkflowsResponse.map(({id, display_name}) => ({id, displayName: display_name}))
        }));

        expect(checker.check()).to.be.true;
    });


    it('should handle FETCH_ACTIVE_WORKFLOWS_ERROR', () => {
        let state = objectAssign({}, initialState, {
            status: WorkflowActions.WORKFLOW_STATUS.FETCHING,
        });

        checker.setState(state);

        state = workflowReducer(state, {
            type: WorkflowActions.WORKFLOW_TYPES.FETCH_WORKFLOW_ERROR,
            error: 'Unable to fetch workflows'
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: WorkflowActions.WORKFLOW_STATUS.ERROR,
            error: 'Unable to fetch workflows',
        }));

        expect(checker.check()).to.be.true;
    });
});

describe('setWorkflow', () => {
    it('should set workflow', () => {
        const store = storeCreator(initialState);
        store.dispatch(WorkflowActions.setWorkflow('2335'));
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: WorkflowActions.WORKFLOW_TYPES.SET_WORKFLOW,
            id: '2335'
        });
    });
});

describe('fetchWorkflow', () => {
    let state = {
        workflow: objectAssign({}, initialState, {status: WorkflowActions.WORKFLOW_TYPES.READY, currentId: '9965'})
    };

    it('should fetch workflow successfully', () => {
        const stub = mockApiClient({
            workflows: {
                get: () => Promise.resolve(workflowsResponseAberdeen)
            }
        });

        const store = storeCreator(state);

        const result = store.dispatch(WorkflowActions.fetchWorkflow());
        return result.then(() => {
            const actions = store.getActions();
            expect(actions).to.have.length(2);
            expect(actions[0]).to.deep.equal({
                type: WorkflowActions.WORKFLOW_TYPES.FETCH_WORKFLOW
            });
            expect(actions[1]).to.deep.equal({
                type: WorkflowActions.WORKFLOW_TYPES.FETCH_WORKFLOW_SUCCESS,
                data: workflowsResponseAberdeen
            });

            stub.restore();
        });
    });

    it('should set error if workflow cannot be fetched', () => {
        const stub = mockApiClient({
            workflows: {
                get: () => Promise.reject('Unable to fetch workflow')
            }
        });

        const store = storeCreator(state);
        
        const result = store.dispatch(WorkflowActions.fetchWorkflow());
        return result.then(() => {
            const actions = store.getActions();
            expect(actions).to.have.length(2);
            expect(actions[0]).to.deep.equal({
                type: WorkflowActions.WORKFLOW_TYPES.FETCH_WORKFLOW,
            });
            expect(actions[1]).to.deep.equal({
                type: WorkflowActions.WORKFLOW_TYPES.FETCH_WORKFLOW_ERROR,
                error: 'Unable to fetch workflow'
            });

            stub.restore();
        });
    });
});

describe('fetchActiveWorkflows', () => {
    let state = {
        project: {
            id: '7859'
        },
        workflow: initialState
    };

    it('should fetch active workflows successfully', () => {
        const stub = mockApiClient({
            workflows: {
                get: () => Promise.resolve(activeWorkflowsResponse)
            }
        });
 

        const store = storeCreator(state);

        const result = store.dispatch(WorkflowActions.fetchActiveWorkflows());
        return result.then(() => {
            const actions = store.getActions();
            expect(actions).to.have.length(2);
            expect(actions[0]).to.deep.equal({
                type: WorkflowActions.WORKFLOW_TYPES.FETCH_ACTIVE_WORKFLOWS
            });
            expect(actions[1]).to.deep.equal({
                type: WorkflowActions.WORKFLOW_TYPES.FETCH_ACTIVE_WORKFLOWS_SUCCESS,
                data: activeWorkflowsResponse
            });

            stub.restore();
        });
    });

    it('should set error if workflow cannot be fetched', () => {
        const stub = mockApiClient({
            workflows: {
                get: () => Promise.reject('Unable to fetch workflows')
            }
        });
 
        const store = storeCreator(state);
        
        const result = store.dispatch(WorkflowActions.fetchActiveWorkflows());
        return result.then(() => {
            const actions = store.getActions();
            expect(actions).to.have.length(2);
            expect(actions[0]).to.deep.equal({
                type: WorkflowActions.WORKFLOW_TYPES.FETCH_ACTIVE_WORKFLOWS,
            });
            expect(actions[1]).to.deep.equal({
                type: WorkflowActions.WORKFLOW_TYPES.FETCH_ACTIVE_WORKFLOWS_ERROR,
                error: 'Unable to fetch workflows'
            });
        });
    });
});
