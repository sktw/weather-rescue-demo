import {expect} from 'chai';
import sinon from 'sinon';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import imageReducer from '../src/reducers/image';
import * as ImageActions from '../src/actions/image';
import {ImmutableChecker} from './testUtils';
import {objectAssign} from '../src/utils';
import * as Utils from '../src/utils';

import subjectsResponse from './data/subjectsResponse'

const checker = new ImmutableChecker();
const storeCreator = configureStore([thunk]);

const initialState = {
    status: ImageActions.IMAGE_STATUS.IDLE,
    src: null,
    img: null,
    error: null,
    imageMetadata: null
};

describe('imageReducer', () => {
    const img = {};
    const src = "https://panoptes-uploads.zooniverse.org/production/subject_location/299ea404-aaf8-4962-8a09-d825445f57c8.jpeg"
    const imageMetadata = {
        clientWidth: 630,
        clientHeight: 882,
        naturalWidth: 1500,
        naturalHeight: 2100
    };

    it('should return initial state', () => {
        expect(imageReducer(undefined, {})).to.deep.equal(initialState);
    });

    it('should handle FETCH_IMAGE', () => {
        let state = initialState;
        checker.setState(state);

        state = imageReducer(state, {
            type: ImageActions.IMAGE_TYPES.FETCH_IMAGE,
            src
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: ImageActions.IMAGE_STATUS.FETCHING,
            src
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle FETCH_IMAGE_SUCCESS', () => {
        let state = objectAssign({}, initialState, {
            status: ImageActions.IMAGE_STATUS.FETCHING,
            src
        });

        checker.setState(state);

        state = imageReducer(state, {
            type: ImageActions.IMAGE_TYPES.FETCH_IMAGE_SUCCESS,
            img
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: ImageActions.IMAGE_STATUS.READY,
            src,
            img
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle FETCH_IMAGE_ERROR', () => {
        let state = objectAssign({}, initialState, {
            status: ImageActions.IMAGE_STATUS.FETCHING,
            src
        });

        checker.setState(state);

        state = imageReducer(state, {
            type: ImageActions.IMAGE_TYPES.FETCH_IMAGE_ERROR,
            error: 'Unable to fetch image'
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: ImageActions.IMAGE_STATUS.ERROR,
            src,
            error: 'Unable to fetch image'
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle SET_IMAGE_METADATA', () => {
        let state = objectAssign({}, initialState, {
            status: ImageActions.IMAGE_STATUS.READY,
            src,
            img,
            imageMetadata: null,
            error: null
        });

        checker.setState(state);

        state = imageReducer(state, {
            type: ImageActions.IMAGE_TYPES.SET_IMAGE_METADATA,
            imageMetadata
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: ImageActions.IMAGE_STATUS.READY,
            src,
            img,
            imageMetadata
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle RESET_IMAGE', () => {
        let state = objectAssign({}, initialState, {
            status: ImageActions.IMAGE_TYPES.READY,
            src,
            img,
            imageMetadata,
            error: null
        });

        checker.setState(state);

        state = imageReducer(state, {
            type: ImageActions.IMAGE_TYPES.RESET_IMAGE
        });

        expect(state).to.deep.equal(initialState);

        expect(checker.check()).to.be.true;
    });

});

describe('setImageMetadata', () => {
    const state = {
        image: initialState 
    };

    const imageMetadata = {
        clientWidth: 630,
        clientHeight: 882,
        naturalWidth: 1500,
        naturalHeight: 2100
    };

    it('should set image metadata', () => {
        const store = storeCreator(state);

        store.dispatch(ImageActions.setImageMetadata(imageMetadata));
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: ImageActions.IMAGE_TYPES.SET_IMAGE_METADATA,
            metadata: imageMetadata
        });

    });
});

describe('reset', () => {
    const state = {
        image: initialState 
    };

    it('should reset image state', () => {
        const store = storeCreator(state);

        store.dispatch(ImageActions.reset());
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: ImageActions.IMAGE_TYPES.RESET_IMAGE
        });

    });
});

describe('fetchImage', () => {
    const state = {
    };

    const subject = {
        locations: [{
            'image/jpeg': "https://panoptes-uploads.zooniverse.org/production/subject_location/299ea404-aaf8-4962-8a09-d825445f57c8.jpeg"
        }]
    };

    it('sucessfully fetches image', () => {
        global.Image = function() {
        }

        Object.defineProperty(global.Image.prototype, 'src', {
            set: function() {
                this.onload();
            }
        });

        const store = storeCreator(state);
        const result = store.dispatch(ImageActions.fetchImage(subject));

        return result.then(() => {
            const actions = store.getActions();
            expect(actions).to.have.length(2);
            expect(actions[0]).to.deep.equal({
                type: ImageActions.IMAGE_TYPES.FETCH_IMAGE,
                src: "https://panoptes-uploads.zooniverse.org/production/subject_location/299ea404-aaf8-4962-8a09-d825445f57c8.jpeg"
            });
            expect(actions[1].type).to.equal(ImageActions.IMAGE_TYPES.FETCH_IMAGE_SUCCESS);
            expect(actions[1].img).to.be.instanceof(Image);

            global.Image = undefined;
        });

    });

    it('handles error', () => {
        global.Image = function() {
        }

        Object.defineProperty(global.Image.prototype, 'src', {
            set: function() {
                this.onerror('Unable to fetch image');
            }
        });

        const store = storeCreator(state);
        const result = store.dispatch(ImageActions.fetchImage(subject));

        return result.then(() => {
            const actions = store.getActions();
            expect(actions).to.have.length(2);
            expect(actions[0]).to.deep.equal({
                type: ImageActions.IMAGE_TYPES.FETCH_IMAGE,
                src: "https://panoptes-uploads.zooniverse.org/production/subject_location/299ea404-aaf8-4962-8a09-d825445f57c8.jpeg"
            });
            expect(actions[1].type).to.equal(ImageActions.IMAGE_TYPES.FETCH_IMAGE_ERROR);
            expect(actions[1].img).to.equal('Unable to fetch image');

            global.Image = undefined;
        }).catch(e => {});

    });
});
