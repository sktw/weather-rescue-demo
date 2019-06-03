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
        nextId: 1,
        map: {}
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


    it('should handle ADD_ANNOTATION', () => {
        const start = objectAssign({}, initialState);
        checker.setState(start);

        const state = reducer(start, {
            type: SubjectViewerActions.SUBJECT_VIEWER_TYPES.ADD_ANNOTATION,
            annotation: {
                kind: 'line',
                line: [[4, 19], [-6, 100]]
            }
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            annotations: {
                nextId: 2,
                map: {
                    1: {
                        kind: 'line',
                        line: [[4, 19], [-6, 100]]
                    }
                }
            }
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle UPDATE_ANNOTATION', () => {
        const start = objectAssign({}, initialState, {
            annotations: {
                nextId: 3,
                map: {
                    1: {
                        kind: 'line',
                        line: [[4, 19], [-6, 100]]
                    },
                    2: {
                        kind: 'rect',
                        rect: [[10, 20], [150, 200]]
                    }
                }
            }
        });

        checker.setState(start);

        const state = reducer(start, {
            type: SubjectViewerActions.SUBJECT_VIEWER_TYPES.UPDATE_ANNOTATION,
            id: 1,
            annotation: {
                line: [[4, 19], [50, 100]]
            }
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            annotations: {
                nextId: 3,
                map: {
                    1: {
                        kind: 'line',
                        line: [[4, 19], [50, 100]]
                    },
                    2: {
                        kind: 'rect',
                        rect: [[10, 20], [150, 200]]
                    }
                }
            }
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle REMOVE_ANNOTATION', () => {
        const start = objectAssign({}, initialState, {
            annotations: {
                nextId: 3,
                map: {
                    1: {
                        kind: 'line',
                        line: [[4, 19], [-6, 100]]
                    },
                    2: {
                        kind: 'rect',
                        rect: [[10, 20], [150, 200]]
                    }
                }
            }
        });

        checker.setState(start);

        const state = reducer(start, {
            type: SubjectViewerActions.SUBJECT_VIEWER_TYPES.REMOVE_ANNOTATION,
            id: 1
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            annotations: {
                nextId: 3,
                map: {
                    2: {
                        kind: 'rect',
                        rect: [[10, 20], [150, 200]]
                    }
                }
            }
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle RESET_ANNOTATIONS and reset only annotations', () => {
        const start = objectAssign({}, initialState, {
            subTools: {
                [TOOL_TYPES.ANNOTATE]: SUBTOOL_TYPES.ANNOTATE.MOVE,
                [TOOL_TYPES.PAN]: SUBTOOL_TYPES.PAN.HORIZONTAL
            },
            highlight: {
                on: true,
                defaultSize: 50,
                size: 18
            },
            annotations: {
                nextId: 3,
                map: {
                    1: {
                        kind: 'line',
                        line: [[4, 19], [-6, 100]]
                    },
                    2: {
                        kind: 'rect',
                        rect: [[10, 20], [150, 200]]
                    }
                }
            }
        });

        checker.setState(start);

        const state = reducer(start, {
            type: SubjectViewerActions.SUBJECT_VIEWER_TYPES.RESET_ANNOTATIONS
        });

        expect(state).to.deep.equal(objectAssign({}, start, {
            subTools: {
                [TOOL_TYPES.ANNOTATE]: SUBTOOL_TYPES.ANNOTATE.MOVE,
                [TOOL_TYPES.PAN]: SUBTOOL_TYPES.PAN.HORIZONTAL
            },
            highlight: {
                on: true,
                defaultSize: 50,
                size: 18
            },
            annotations: {
                nextId: 1,
                map: {}
            }
        }));

        expect(checker.check()).to.be.true;
    });

    it('should handle RESET and reset all but tool and subtool and highlighter default size', () => {
        const start = objectAssign({}, initialState, {
            tool: TOOL_TYPES.ANNOTATE,
            subTools: {
                [TOOL_TYPES.ANNOTATE]: SUBTOOL_TYPES.ANNOTATE.RECTANGLE,
                [TOOL_TYPES.PAN]: SUBTOOL_TYPES.PAN.ALL
            },
            highlight: {
                on: true,
                defaultSize: 28,
                size: 18
            },
            annotations: {
                nextId: 3,
                map: {
                    1: {
                        kind: 'line',
                        line: [[4, 19], [-6, 100]]
                    },
                    2: {
                        kind: 'rect',
                        rect: [[10, 20], [150, 200]]
                    }
                }
            }
        });

        checker.setState(start);

        const state = reducer(start, {
            type: ViewerActions.VIEWER_TYPES.RESET
        });

        expect(state).to.deep.equal(objectAssign({}, initialState, {
            tool: TOOL_TYPES.ANNOTATE,
            subTools: {
                [TOOL_TYPES.ANNOTATE]: SUBTOOL_TYPES.ANNOTATE.RECTANGLE,
                [TOOL_TYPES.PAN]: SUBTOOL_TYPES.PAN.ALL
            },
            highlight: {
                on: false,
                defaultSize: 28,
                size: 28
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

describe('addAnnotation', () => {
    it('should add an annotation', () => {
        const store = storeCreator(initialState);
        store.dispatch(SubjectViewerActions.addAnnotation({
            kind: 'line',
            line: [[4, 19], [-6, 100]],
        }));
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: SubjectViewerActions.SUBJECT_VIEWER_TYPES.ADD_ANNOTATION,
            annotation: {
                kind: 'line',
                line: [[4, 19], [-6, 100]]
            }
        });
    });
});

describe('updateAnnotation', () => {
    it('should update an annotation', () => {
        const store = storeCreator(initialState);
        store.dispatch(SubjectViewerActions.updateAnnotation(1, {
            line: [[4, 19], [50, 100]],
        }));
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: SubjectViewerActions.SUBJECT_VIEWER_TYPES.UPDATE_ANNOTATION,
            id: 1,
            annotation: {
                line: [[4, 19], [50, 100]]
            }
        });
    });
});

describe('removeAnnotation', () => {
    it('should update an annotation', () => {
        const store = storeCreator(initialState);
        store.dispatch(SubjectViewerActions.removeAnnotation(3));
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.deep.equal({
            type: SubjectViewerActions.SUBJECT_VIEWER_TYPES.REMOVE_ANNOTATION,
            id: 3
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
