import {expect} from 'chai';
import sinon from 'sinon';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import classificationReducer from '../src/reducers/classification';
import * as ClassificationActions from '../src/actions/classification';
import {ImmutableChecker} from './testUtils';
import {objectAssign} from '../src/utils';
import * as Utils from '../src/utils';
import * as Session from '../src/session';

import projectsResponse from './data/projectsResponse';
import workflowsResponseAberdeen from './data/workflowsResponseAberdeen';
import subjectsResponse from './data/subjectsResponse';

const checker = new ImmutableChecker();
const storeCreator = configureStore([thunk]);

const initialState = {
    currentClassification: null,
    status: ClassificationActions.CLASSIFICATION_STATUS.IDLE,
    error: null
};

describe('classificationReducer', () => {
    const classification = {
        annotations: [],
        metadata: {
            user_language: 'en' 
        },
        links: {}
    };


    it('should return initial state', () => {
        expect(classificationReducer(undefined, {})).to.deep.equal(initialState);
    });

    it('should handle START_CLASSIFICATION', () => {
        let state = initialState;
        checker.setState(state);

        state = classificationReducer(state, {
            type: ClassificationActions.CLASSIFICATION_TYPES.START_CLASSIFICATION,
            data: classification
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: ClassificationActions.CLASSIFICATION_STATUS.IDLE,
            currentClassification: classification,
            error: null
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle SUBMIT_CLASSIFICATION', () => {
        let state = objectAssign({}, initialState, {
            currentClassification: classification
        });

        checker.setState(state);

        state = classificationReducer(state, {
            type: ClassificationActions.CLASSIFICATION_TYPES.SUBMIT_CLASSIFICATION
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: ClassificationActions.CLASSIFICATION_STATUS.SENDING,
            currentClassification: classification
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle SUBMIT_CLASSIFICATION_SUCCESS', () => {
        let state = objectAssign({}, initialState, {
            currentClassification: classification,
            status: ClassificationActions.CLASSIFICATION_STATUS.SENDING
        });

        checker.setState(state);

        state = classificationReducer(state, {
            type: ClassificationActions.CLASSIFICATION_TYPES.SUBMIT_CLASSIFICATION_SUCCESS
        });

        expect(state).to.deep.equal(initialState);

        expect(checker.check()).to.be.true;
    });

    it('should handle SUBMIT_CLASSIFICATION_ERROR', () => {
        let state = objectAssign({}, initialState, {
            currentClassification: classification,
            status: ClassificationActions.CLASSIFICATION_STATUS.SENDING
        });

        checker.setState(state);

        state = classificationReducer(state, {
            type: ClassificationActions.CLASSIFICATION_TYPES.SUBMIT_CLASSIFICATION_ERROR,
            error: 'Unable to submit classification'
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            status: ClassificationActions.CLASSIFICATION_STATUS.ERROR,
            currentClassification: classification,
            error: 'Unable to submit classification'
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle COMPLETE_CLASSIFICATION', () => {
        let state = objectAssign({}, initialState, {
            currentClassification: classification,
        });

        checker.setState(state);

        const update = {
            annotations: [{
                task: 'T1',
                value: '45'
            }],
            metadata: {
                viewport: {
                    width: 1200,
                    height: 800
                }
            }
        };

        state = classificationReducer(state, {
            type: ClassificationActions.CLASSIFICATION_TYPES.COMPLETE_CLASSIFICATION,
            update
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            currentClassification: {
                annotations: update.annotations,
                metadata: objectAssign({}, classification.metadata, update.metadata),
                links: classification.links
            }
        }));

        expect(checker.check()).to.be.true;
    });
});

describe('startClassification', () => {
    const state = {
        project: {
            id: '7859',
            data: projectsResponse
        },
        workflow: {
            currentWorkflow: workflowsResponseAberdeen
        },
        subject: {
            currentSubject: subjectsResponse[0]
        }
    };

    it('should create initial classification object', () => {
        const dateStub = sinon.stub(Utils, 'getCurrentDate');
        dateStub.callsFake(() => {
            return {
                toISOString: () => '2019-04-11T21:00:17.301Z',
                getTimezoneOffset: () => -60,
            };
        });

        global.navigator = {
            userAgent: "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:65.0) Gecko/20100101 Firefox/65.0",
        };

        const store = storeCreator(state);
        store.dispatch(ClassificationActions.startClassification());

        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: ClassificationActions.CLASSIFICATION_TYPES.START_CLASSIFICATION,
            data: {
                annotations: [],
                metadata: {
                    workflow_version: state.workflow.currentWorkflow.version,
                    started_at: dateStub().toISOString(),
                    user_agent: global.navigator.userAgent,
                    user_language: 'en',
                    utc_offset: (dateStub().getTimezoneOffset() * 60).toString(),
                    subject_dimensions: (state.subject.currentSubject.locations.map(() => null))
                },
                links: {
                    project: state.project.id,
                    workflow: state.workflow.currentWorkflow.id,
                    subjects: [state.subject.currentSubject.id]
                }
            }
        });

        dateStub.restore();
        global.navigator = undefined;
    });
});

describe('completeClassification', () => {
    const state = {
        project: {
            id: '7859',
            data: projectsResponse
        },
        workflow: {
            currentWorkflow: workflowsResponseAberdeen
        },
        subject: {
            currentSubject: subjectsResponse[0]
        },
        image: {
            imageMetadata: {
                clientWidth: 630,
                clientHeight: 882,
                naturalWidth: 1500,
                naturalHeight: 2100
            }
        }
    };

    it('should finalize the classification object', () => {
        const dateStub = sinon.stub(Utils, 'getCurrentDate');
        dateStub.callsFake(() => {
            return {
                toISOString: () => '2019-04-11T21:00:17.301Z',
                getTimezoneOffset: () => -60,
            };
        });

        const sessionStub = sinon.stub(Session, 'getSessionId');
        sessionStub.callsFake(() => "0fd50c3df56a4465e4c9dad3f5526bc0602dc3b067bca699ecb1e44bc64c5ad8");

        global.window = {
            innerWidth: 1855,
            innerHeight: 679
        };

        const annotations =  [{
            task: 'T1',
            value: '45'
        }];

        const store = storeCreator(state);
        store.dispatch(ClassificationActions.completeClassification(annotations));

        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: ClassificationActions.CLASSIFICATION_TYPES.COMPLETE_CLASSIFICATION,
            update: {
                annotations,
                metadata: {
                    session: sessionStub(),
                    finished_at: dateStub().toISOString(),
                    viewport: {
                        width: global.window.innerWidth,
                        height: global.window.innerHeight
                    },
                    subject_dimensions: state.image.imageMetadata
                }
            }
        });

        dateStub.restore();
        sessionStub.restore();
        global.window = undefined;
    });
});

describe('submitClassification', () => {
    const state = {};

    it('should submit completed classification', () => {
        const store = storeCreator(state);

        const result = store.dispatch(ClassificationActions.submitClassification());
        return result.then(() => {
            const actions = store.getActions();
            expect(actions).to.have.length(2);
            expect(actions[0]).to.deep.equal({
                type: ClassificationActions.CLASSIFICATION_TYPES.SUBMIT_CLASSIFICATION
            });
            expect(actions[1]).to.deep.equal({
                type: ClassificationActions.CLASSIFICATION_TYPES.SUBMIT_CLASSIFICATION_SUCCESS,
            });

        });
    });
});
