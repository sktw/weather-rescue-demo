import {expect} from 'chai';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import reducer from '../src/reducers/project';
import * as Actions from '../src/actions/project';
import {ImmutableChecker, mockApiClient} from './testUtils';
import {objectAssign} from '../src/utils';
import projectsResponse from './data/projectsResponse';

const checker = new ImmutableChecker();
const storeCreator = configureStore([thunk]);

const initialState = {
    status: Actions.PROJECT_STATUS.IDLE,
    id: '',
    data: null,
    error: null
};

describe('reducer', () => {
    it('should return initial state', () => {
        expect(reducer(undefined, {})).to.deep.equal(initialState);
    });

    it('should handle FETCH_PROJECT', () => {
        let state = initialState;
        checker.setState(state);

        state = reducer(state, {
            type: Actions.PROJECT_TYPES.FETCH_PROJECT, 
            id: 4345
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: Actions.PROJECT_STATUS.FETCHING, 
            id: 4345
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle FETCH_PROJECT_SUCCESS', () => {
        let state = objectAssign({}, initialState, {
            status: Actions.PROJECT_STATUS.FETCHING,
            id: 4345
        });

        checker.setState(state);

        state = reducer(state, {
            type: Actions.PROJECT_TYPES.FETCH_PROJECT_SUCCESS, 
            data: projectsResponse
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: Actions.PROJECT_STATUS.READY, 
            id: 4345, 
            data: projectsResponse
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle FETCH_PROJECT_ERROR', () => {
        let state = objectAssign({}, initialState, {
            status: Actions.PROJECT_STATUS.FETCHING,
            id: 4345
        });

        checker.setState(state);

        state = reducer(state, {
            type: Actions.PROJECT_TYPES.FETCH_PROJECT_ERROR, 
            error: 'Unable to fetch project'
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: Actions.PROJECT_STATUS.ERROR, 
            id: 4345, 
            error: 'Unable to fetch project'
        }));

        expect(checker.check()).to.be.true;
    });
});

describe('fetchProject', () => {
    it('should fetch project successfully', () => {
        const stub = mockApiClient({
            projects: {
                get: () => Promise.resolve(projectsResponse)
            }
        });

        const store = storeCreator(initialState);
        const result = store.dispatch(Actions.fetchProject(4345));
        return result.then(() => {
            const actions = store.getActions();
            expect(actions).to.have.length(2);
            expect(actions[0]).to.deep.equal({
                type: Actions.PROJECT_TYPES.FETCH_PROJECT,
                id: 4345
            });
            expect(actions[1]).to.deep.equal({
                type: Actions.PROJECT_TYPES.FETCH_PROJECT_SUCCESS,
                data: projectsResponse
            });

            stub.restore();
        });
    });

    it('should set error if project cannot be fetched', () => {
        const stub = mockApiClient({
            projects: {
                get: () => Promise.reject('Unable to fetch project')
            }
        });

        const store = storeCreator(initialState);
        const result = store.dispatch(Actions.fetchProject('7492'));
        return result.then(() => {
            const actions = store.getActions();
            expect(actions).to.have.length(2);
            expect(actions[0]).to.deep.equal({
                type: Actions.PROJECT_TYPES.FETCH_PROJECT,
                id: '7492'
            });
            expect(actions[1]).to.deep.equal({
                type: Actions.PROJECT_TYPES.FETCH_PROJECT_ERROR,
                error: 'Unable to fetch project'
            });

            stub.restore();
        });
    });
});
