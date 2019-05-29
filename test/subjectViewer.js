import {expect} from 'chai';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {objectAssign} from '../src/utils';
import reducer from '../src/reducers/subjectViewer';
import * as ViewerActions from '../src/actions/viewer';
import {TOOL_TYPES, SUBTOOL_TYPES} from '../src/actions/subjectViewer';
import * as SubjectViewerActions from '../src/actions/subjectViewer';
import {ImmutableChecker} from './testUtils';

const checker = new ImmutableChecker();
const storeCreator = configureStore([thunk]);

const initialState = objectAssign({}, {
    zoomValue: 'fit-width',
    zoomScale: 1.0,
    rotation: 0,
    pan: [0, 0],
    viewerSize: null,
    imageSize: null,
    error: null,
    maintainCentre: false
}, {
    tool: TOOL_TYPES.PAN,
    subTools: {
        [TOOL_TYPES.ANNOTATE]: SUBTOOL_TYPES.ANNOTATE.MOVE,
        [TOOL_TYPES.PAN]: SUBTOOL_TYPES.PAN.VERTICAL
    },
    highlight: {
        on: false,
        defaultSize: 50,
        size: 50
    },
    annotations: {
        lines: [],
        rectangles: []
    }
});

describe('reducer', () => {
    it('should return initial state', () => {
        expect(reducer(undefined, {})).to.deep.equal(initialState);
    });

    it('should handle SET_TOOL', () => {
        const start = objectAssign({}, initialState);
        checker.setState(start);

        const state = reducer(start, {
            type: SubjectViewerActions.SUBJECT_VIEWER_TYPES.SET_TOOL,
            tool: TOOL_TYPES.ANNOTATE
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            tool: TOOL_TYPES.ANNOTATE
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle SET_SUBTOOL', () => {
        const start = objectAssign({}, initialState);
        checker.setState(start);

        const state = reducer(start, {
            type: SubjectViewerActions.SUBJECT_VIEWER_TYPES.SET_SUBTOOL,
            subTool: SUBTOOL_TYPES.PAN.HORIZONTAL
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            subTools: {
                [TOOL_TYPES.ANNOTATE]: SUBTOOL_TYPES.ANNOTATE.MOVE,
                [TOOL_TYPES.PAN]: SUBTOOL_TYPES.PAN.HORIZONTAL
            }
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle SET_HIGHLIGHT_ON', () => {
        const start = objectAssign({}, initialState);
        checker.setState(start);

        const state = reducer(start, {
            type: SubjectViewerActions.SUBJECT_VIEWER_TYPES.SET_HIGHLIGHT_ON,
            on: true
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            highlight: {
                on: true,
                defaultSize: 50,
                size: 50
            },
            maintainCentre: true
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle SET_HIGHLIGHT_SIZE', () => {
        const start = objectAssign({}, initialState);
        checker.setState(start);

        const state = reducer(start, {
            type: SubjectViewerActions.SUBJECT_VIEWER_TYPES.SET_HIGHLIGHT_SIZE,
            size: 48
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            highlight: {
                on: false,
                defaultSize: 50,
                size: 48
            }
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle SET_VIEWER_SIZE', () => {
        const start = objectAssign({}, initialState);
        checker.setState(start);

        const state = reducer(start, {
            type: ViewerActions.VIEWER_TYPES.SET_VIEWER_SIZE,
            size: [500, 800]
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            viewerSize: [500, 800],
            highlight: {
                on: false,
                defaultSize: 14,
                size: 14
            }
        }));

        expect(checker.check()).to.be.true;
    });


    it('should handle SET_ANNOTATIONS', () => {
        let state = initialState;
        checker.setState(state);

        state = reducer(state, {
            type: SubjectViewerActions.SUBJECT_VIEWER_TYPES.SET_ANNOTATIONS,
            annotations: {
                lines: [[[4, 19], [-6, 100]]],
                rectangles: []
            }
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            annotations: {
                lines: [[[4, 19], [-6, 100]]],
                rectangles: []
            }
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle RESET_ANNOTATIONS and reset only annotations', () => {
        let state = objectAssign({}, initialState, {
            subTools: {
                [TOOL_TYPES.ANNOTATE]: SUBTOOL_TYPES.ANNOTATE.MOVE,
                [TOOL_TYPES.PAN]: SUBTOOL_TYPES.PAN.HORIZONTAL
            },
            pan: [5, 4],
            annotations: {
                lines: [[[4, 19], [-6, 100]]],
                rectangles: []
            }
        });

        checker.setState(state);

        state = reducer(state, {
            type: SubjectViewerActions.SUBJECT_VIEWER_TYPES.RESET_ANNOTATIONS
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            subTools: {
                [TOOL_TYPES.ANNOTATE]: SUBTOOL_TYPES.ANNOTATE.MOVE,
                [TOOL_TYPES.PAN]: SUBTOOL_TYPES.PAN.HORIZONTAL
            },
            pan: [5, 4],
            annotations: {
                lines: [],
                rectangles: []
            }
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle RESET and reset all but tool and subtool', () => {
        let state = objectAssign({}, initialState, {
            tool: TOOL_TYPES.ANNOTATE,
            subTools: {
                [TOOL_TYPES.ANNOTATE]: SUBTOOL_TYPES.ANNOTATE.RECTANGLE,
                [TOOL_TYPES.PAN]: SUBTOOL_TYPES.PAN.ALL
            },
            pan: [6, 6],
            annotations: {
                lines: [],
                rectangles: [[[4, 5], [-60, 4]]]
            }
        });

        checker.setState(state);

        state = reducer(state, {
            type: ViewerActions.VIEWER_TYPES.RESET
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            tool: TOOL_TYPES.ANNOTATE,
            subTools: {
                [TOOL_TYPES.ANNOTATE]: SUBTOOL_TYPES.ANNOTATE.RECTANGLE,
                [TOOL_TYPES.PAN]: SUBTOOL_TYPES.PAN.ALL
            }
        }));

        expect(checker.check()).to.be.true;
    });
});

describe('setTool', () => {
    it('should set the tool', () => {
        const store = storeCreator(initialState);
        store.dispatch(SubjectViewerActions.setTool(TOOL_TYPES.ANNOTATE));
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: SubjectViewerActions.SUBJECT_VIEWER_TYPES.SET_TOOL,
            tool: TOOL_TYPES.ANNOTATE
        });
    });
});

describe('setSubTool', () => {
    it('should set the subTool', () => {
        const store = storeCreator(initialState);
        store.dispatch(SubjectViewerActions.setSubTool(SUBTOOL_TYPES.ANNOTATE.EDIT));
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: SubjectViewerActions.SUBJECT_VIEWER_TYPES.SET_SUBTOOL,
            subTool: SUBTOOL_TYPES.ANNOTATE.EDIT
        });
    });
});

describe('setHighlightOn', () => {
    it('should set the highlight on', () => {
        const store = storeCreator(initialState);
        store.dispatch(SubjectViewerActions.setHighlightOn(true));
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: SubjectViewerActions.SUBJECT_VIEWER_TYPES.SET_HIGHLIGHT_ON,
            on: true
        });
    });
});

describe('setHighlightSize', () => {
    it('should set the highlight size', () => {
        const store = storeCreator(initialState);
        store.dispatch(SubjectViewerActions.setHighlightSize(52));
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: SubjectViewerActions.SUBJECT_VIEWER_TYPES.SET_HIGHLIGHT_SIZE,
            size: 52
        });
    });
});

describe('setAnnotations', () => {
    it('should set the annotations', () => {
        const store = storeCreator(initialState);
        store.dispatch(SubjectViewerActions.setAnnotations({
            lines: [[[4, 19], [-6, 100]]],
            rectangles: []
        }));
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: SubjectViewerActions.SUBJECT_VIEWER_TYPES.SET_ANNOTATIONS,
            annotations: {
                lines: [[[4, 19], [-6, 100]]],
                rectangles: []
            }
        });
    });
});

describe('resetAnnotations', () => {
    it('should reset the annotations', () => {
        const store = storeCreator(initialState);
        store.dispatch(SubjectViewerActions.resetAnnotations());
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: SubjectViewerActions.SUBJECT_VIEWER_TYPES.RESET_ANNOTATIONS
        });
    });
});


