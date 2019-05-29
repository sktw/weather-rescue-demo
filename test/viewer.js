import {expect} from 'chai';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {objectAssign} from '../src/utils';
import reducer from '../src/reducers/viewer';
import * as Actions from '../src/actions/viewer';
import * as ImageActions from '../src/actions/image';
import {ImmutableChecker, getChainActions} from './testUtils';

const checker = new ImmutableChecker();
const storeCreator = configureStore([thunk]);

const chainActions = getChainActions(reducer);

const initialState = {
    zoomValue: 'fit-width',
    zoomScale: 1.0,
    rotation: 0,
    pan: [0, 0],
    viewerSize: null,
    imageSize: null,
    error: null,
    maintainCentre: false
};

describe('reducer', () => {
    it('should return initial state', () => {
        expect(reducer(undefined, {})).to.deep.equal(initialState);
    });

    it('should handle SET_PAN', () => {
        const start = objectAssign({}, initialState);
        checker.setState(start);

        const state = reducer(start, {
            type: Actions.VIEWER_TYPES.SET_PAN,
            pan: [4, 8]
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            pan: [4, 8]
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle RESET_PAN', () => {
        const start = objectAssign({}, initialState, {
            pan: [4, 8]
        });

        checker.setState(start);

        const state = reducer(start, {
            type: Actions.VIEWER_TYPES.RESET_PAN
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            pan: [0, 0]
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle FETCH_IMAGE_SUCCESS', () => {
        const start = objectAssign({}, initialState);

        checker.setState(start);

        const state = reducer(start, {
            type: ImageActions.IMAGE_TYPES.FETCH_IMAGE_SUCCESS,
            img: {
                naturalWidth: 1000,
                naturalHeight: 2000
            }
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            imageSize: [1000, 2000]
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle SET_ZOOM_VALUE with zoomValue = actual-size', () => {
        const start = objectAssign({}, initialState, {
            imageSize: [1000, 2000],
            viewerSize: [800, 1500]
        });

        checker.setState(start);

        const state = reducer(start, {
            type: Actions.VIEWER_TYPES.SET_ZOOM_VALUE,
            zoomValue: 'actual-size'
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            zoomValue: 'actual-size',
            zoomScale: 1.0
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle SET_ZOOM_VALUE with zoomValue = fit-height', () => {
        const start = objectAssign({}, initialState, {
            imageSize: [1000, 2000],
            viewerSize: [800, 1500]
        });

        checker.setState(start);

        const state = reducer(start, {
            type: Actions.VIEWER_TYPES.SET_ZOOM_VALUE,
            zoomValue: 'fit-height'
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            zoomValue: 'fit-height',
            zoomScale: 0.75
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle SET_ZOOM_VALUE with zoomValue = fit-width', () => {
        const start = objectAssign({}, initialState, {
            imageSize: [1000, 2000],
            viewerSize: [800, 1500]
        });

        checker.setState(start);

        const state = reducer(start, {
            type: Actions.VIEWER_TYPES.SET_ZOOM_VALUE,
            zoomValue: 'fit-width'
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            zoomValue: 'fit-width',
            zoomScale: 0.8
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle SET_ZOOM_VALUE with zoomValue = 60', () => {
        const start = objectAssign({}, initialState, {
            imageSize: [1000, 2000],
            viewerSize: [800, 1500]
        });

        checker.setState(start);

        const state = reducer(start, {
            type: Actions.VIEWER_TYPES.SET_ZOOM_VALUE,
            zoomValue: '60'
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            zoomValue: '60',
            zoomScale: 0.6
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle SET_ZOOM_VALUE with maintainCentre = true', () => {
        const start = objectAssign({}, initialState, {
            imageSize: [1000, 2000],
            viewerSize: [800, 1500],
            zoomValue: 'actual-size',
            zoomScale: 1.0,
            maintainCentre: true
        });

        checker.setState(start);

        const state = reducer(start, {
            type: Actions.VIEWER_TYPES.SET_ZOOM_VALUE,
            zoomValue: '120'
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            zoomValue: '120',
            zoomScale: 1.2,
            pan: [-66.66666666666663, -125]
        }));

        expect(checker.check()).to.be.true;
    });



    it('should handle APPLY_ROTATION with rotation of 90 degrees anticlockwise with zoomValue = actual-size', () => {
        const start = objectAssign({}, initialState, {
            zoomValue: 'actual-size',
            zoomScale: 1.0,
            imageSize: [1000, 2000],
            viewerSize: [800, 1500]
        });
        checker.setState(start);

        const state = reducer(start, {
            type: Actions.VIEWER_TYPES.APPLY_ROTATION,
            delta: 1
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            rotation: 1
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle APPLY_ROTATION with rotation of 90 degrees anticlockwise from 270 degrees with zoomValue = actual-size', () => {
        const start = objectAssign({}, initialState, {
            rotation: 3,
            zoomValue: 'actual-size',
            zoomScale: 1.0,
            imageSize: [1000, 2000],
            viewerSize: [800, 1500]
        });
        checker.setState(start);

        const state = reducer(start, {
            type: Actions.VIEWER_TYPES.APPLY_ROTATION,
            delta: 1
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            rotation: 0
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle APPLY_ROTATION with rotation of 90 degrees anticlockwise with zoomValue = fit-width', () => {
        const start = objectAssign({}, initialState, {
            zoomValue: 'fit-width',
            zoomScale: 0.8,
            imageSize: [1000, 2000],
            viewerSize: [800, 1500]
        });
        checker.setState(start);

        const state = reducer(start, {
            type: Actions.VIEWER_TYPES.APPLY_ROTATION,
            delta: 1
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            rotation: 1,
            zoomScale: 0.4
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle APPLY_ROTATION with rotation of 90 degrees anticlockwise with zoomValue = fit-width and maintainCentre = true', () => {
        const start = objectAssign({}, initialState, {
            zoomValue: 'fit-width',
            zoomScale: 0.8,
            imageSize: [1000, 2000],
            viewerSize: [800, 1500],
            maintainCentre: true
        });
        checker.setState(start);

        const state = reducer(start, {
            type: Actions.VIEWER_TYPES.APPLY_ROTATION,
            delta: 1
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            rotation: 1,
            zoomScale: 0.4,
            pan: [1375, 62.5]
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle SET_VIEWER_SIZE with zoomValue = actual-size', () => {
        const start = objectAssign({}, initialState, {
            zoomValue: 'actual-size',
            zoomScale: 1.0,
            imageSize: [1000, 2000],
            viewerSize: [800, 1500]
        });

        checker.setState(start);

        const state = reducer(start, {
            type: Actions.VIEWER_TYPES.SET_VIEWER_SIZE,
            size: [900, 1200]
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            viewerSize: [900, 1200]
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle SET_VIEWER_SIZE with zoomValue = fit-width', () => {
        const start = objectAssign({}, initialState, {
            zoomValue: 'fit-width',
            zoomScale: 0.8,
            imageSize: [1000, 2000],
            viewerSize: [800, 1500]
        });

        checker.setState(start);

        const state = reducer(start, {
            type: Actions.VIEWER_TYPES.SET_VIEWER_SIZE,
            size: [900, 1200]
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            viewerSize: [900, 1200],
            zoomScale: 0.9
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle SET_VIEWER_SIZE with zoomValue = fit-width and maintainCentre = true', () => {
        const start = objectAssign({}, initialState, {
            zoomValue: 'fit-width',
            zoomScale: 0.8,
            imageSize: [1000, 2000],
            viewerSize: [800, 1500],
            maintainCentre: true
        });

        checker.setState(start);

        const state = reducer(start, {
            type: Actions.VIEWER_TYPES.SET_VIEWER_SIZE,
            size: [900, 1200]
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            viewerSize: [900, 1200],
            zoomScale: 0.9,
            pan: [0, -270.83333333333337]
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle SET_ERROR', () => {
        const start = objectAssign({}, initialState);
        checker.setState(start);

        const state = reducer(start, {
            type: Actions.VIEWER_TYPES.SET_ERROR,
            error: 'Error'
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            error: 'Error'
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle CLEAR_ERROR', () => {
        const start = objectAssign({}, initialState, {
            error: 'Error'
        });

        checker.setState(start);

        const state = reducer(start, {
            type: Actions.VIEWER_TYPES.CLEAR_ERROR
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            error: null
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle RESET', () => {
        const start = {
            imageSize: [1000, 2000],
            viewerSize: [800, 1500],
            zoomValue: 'fit-height',
            zoomScale: 0.75,
            rotation: 2,
            error: 'Error'
        };
        checker.setState(start);

        const state = reducer(start, {
            type: Actions.VIEWER_TYPES.RESET
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            imageSize: [1000, 2000],
            viewerSize: [800, 1500],
            zoomScale: 0.8
        }));

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

describe('setPan', () => {
    it('should set the pan', () => {
        const store = storeCreator(initialState);
        store.dispatch(Actions.setPan([-5, 7]));
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: Actions.VIEWER_TYPES.SET_PAN,
            pan: [-5, 7]
        });
    });
});

describe('resetPan', () => {
    it('should reset the pan', () => {
        const store = storeCreator(initialState);
        store.dispatch(Actions.resetPan());
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: Actions.VIEWER_TYPES.RESET_PAN
        });
    });
});

describe('setViewerSize', () => {
    it('should set the viewer size', () => {
        const store = storeCreator(initialState);
        store.dispatch(Actions.setViewerSize([750, 600]));
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: Actions.VIEWER_TYPES.SET_VIEWER_SIZE,
            size: [750, 600]
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
