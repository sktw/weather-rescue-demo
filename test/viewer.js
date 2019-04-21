import {expect} from 'chai';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {objectAssign} from '../src/utils';
import reducer from '../src/reducers/viewer';
import * as Actions from '../src/actions/viewer';
import {ImmutableChecker, getChainActions} from './testUtils';

const checker = new ImmutableChecker();
const storeCreator = configureStore([thunk]);

const chainActions = getChainActions(reducer);

const initialState = {
    zoomValue: 'fit-width',
    zoomPercentage: 100,
    rotation: 0,
    error: null
};

describe('reducer', () => {
    it('should return initial state', () => {
        expect(reducer(undefined, {})).to.deep.equal(initialState);
    });

    it('should handle SET_ZOOM_VALUE', () => {
        let state = initialState;
        checker.setState(state);

        state = reducer(state, {
            type: Actions.VIEWER_TYPES.SET_ZOOM_VALUE,
            zoomValue: 'fit-height'
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            zoomValue: 'fit-height'
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle SET_ZOOM_PERCENTAGE', () => {
        let state = initialState;
        checker.setState(state);

        state = reducer(state, {
            type: Actions.VIEWER_TYPES.SET_ZOOM_PERCENTAGE,
            zoomValue: 'fit-width',
            zoomPercentage: 56
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            zoomValue: 'fit-width',
            zoomPercentage: 56
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle APPLY_ROTATION with rotation of 90 degrees anticlockwise', () => {
        let state = initialState;
        checker.setState(state);

        state = reducer(state, {
            type: Actions.VIEWER_TYPES.APPLY_ROTATION,
            delta: 1
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            rotation: 1
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle APPLY_ROTATION with overall rotation of 360 degrees', () => {
        let state = objectAssign({}, initialState, {
            rotation: 3
        });

        checker.setState(state);

        state = reducer(state, {
            type: Actions.VIEWER_TYPES.APPLY_ROTATION,
            delta: 1
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            rotation: 0
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle SET_ERROR', () => {
        let state = initialState;
        checker.setState(state);

        state = reducer(state, {
            type: Actions.VIEWER_TYPES.SET_ERROR,
            error: 'Error'
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            error: 'Error'
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle CLEAR_ERROR', () => {
        let state = objectAssign({}, initialState, {
            error: 'Error'
        });

        checker.setState(state);

        state = reducer(state, {
            type: Actions.VIEWER_TYPES.CLEAR_ERROR
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            error: null
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle RESET', () => {
        let state = {
            zoomValue: 'fit-height',
            zoomPercentage: 94,
            rotation: 2,
            error: 'Error'
        };
        checker.setState(state);

        state = reducer(state, {
            type: Actions.VIEWER_TYPES.RESET
        });

        expect(state).to.deep.equal(initialState);
        expect(checker.check()).to.be.true;
    });
});

describe('setZoomValue', () => {
    it('should set the zoom value', () => {
        const store = storeCreator(initialState);
        store.dispatch(Actions.setZoomValue('50%'));
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: Actions.VIEWER_TYPES.SET_ZOOM_VALUE,
            zoomValue: '50%'
        });
    });
});

describe('setZoomPercentage', () => {
    it('should set the zoom percentage', () => {
        const store = storeCreator(initialState);
        store.dispatch(Actions.setZoomPercentage('50%', 50));
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: Actions.VIEWER_TYPES.SET_ZOOM_PERCENTAGE,
            zoomValue: '50%',
            zoomPercentage: 50
        });
    });
});

describe('setError', () => {
    it('should set error', () => {
        const store = storeCreator(initialState);
        store.dispatch(Actions.setError('Error'));
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: Actions.VIEWER_TYPES.SET_ERROR,
            error: 'Error'
        });
    });
});

describe('clearError', () => {
    it('should clear error', () => {
        const store = storeCreator(initialState);
        store.dispatch(Actions.clearError());
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: Actions.VIEWER_TYPES.CLEAR_ERROR
        });
    });
});

describe('applyRotation', () => {
    it('should apply the rotation', () => {
        const store = storeCreator(initialState);
        store.dispatch(Actions.applyRotation(-1));
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: Actions.VIEWER_TYPES.APPLY_ROTATION,
            delta: -1
        });
    });
});

describe('reset', () => {
    it('should reset', () => {
        const store = storeCreator(initialState);
        store.dispatch(Actions.reset());
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: Actions.VIEWER_TYPES.RESET
        });
    });
});


