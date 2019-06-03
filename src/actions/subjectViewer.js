import {createActionTypes} from '../utils';

export const SUBJECT_VIEWER_TYPES = createActionTypes('subjectViewer', {
    SET_TOOL: 'SET_TOOL',
    SET_SUBTOOL: 'SET_SUBTOOL',
    SET_HIGHLIGHT_ON: 'SET_HIGHLIGHT_ON',
    SET_HIGHLIGHT_SIZE: 'SET_HIGHLIGHT_SIZE',
    ADD_ANNOTATION: 'ADD_ANNOTATION',
    UPDATE_ANNOTATION: 'UPDATE_ANNOTATION',
    REMOVE_ANNOTATION: 'REMOVE_ANNOTATION',
    RESET_ANNOTATIONS: 'RESET_ANNOTATIONS'
});

export const TOOL_TYPES = {
    ANNOTATE: 'ANNOTATE',
    PAN: 'PAN'
};

export const SUBTOOL_TYPES = {
    [TOOL_TYPES.ANNOTATE]: {
        LINE: 'LINE',
        RECTANGLE: 'RECTANGLE',
        MOVE: 'MOVE',
        EDIT: 'EDIT',
        DELETE: 'DELETE'
    },
    [TOOL_TYPES.PAN]: {
        ALL: 'ALL',
        VERTICAL: 'VERTICAL',
        HORIZONTAL: 'HORIZONTAL'
    }
};

export function setTool(tool) {
    return {
        type: SUBJECT_VIEWER_TYPES.SET_TOOL,
        tool
    };
}

export function setSubTool(subTool) {
    return {
        type: SUBJECT_VIEWER_TYPES.SET_SUBTOOL,
        subTool
    };
}

export function setHighlightOn(on) {
    return {
        type: SUBJECT_VIEWER_TYPES.SET_HIGHLIGHT_ON,
        on
    };
}

export function setHighlightSize(size) {
    return {
        type: SUBJECT_VIEWER_TYPES.SET_HIGHLIGHT_SIZE,
        size
    };
}

export function addAnnotation(annotation) {
    return {
        type: SUBJECT_VIEWER_TYPES.ADD_ANNOTATION,
        annotation
    };
}

export function updateAnnotation(id, annotation) {
    return {
        type: SUBJECT_VIEWER_TYPES.UPDATE_ANNOTATION,
        id,
        annotation
    };
}

export function removeAnnotation(id) {
    return {
        type: SUBJECT_VIEWER_TYPES.REMOVE_ANNOTATION,
        id
    };
}

export function resetAnnotations() {
    return {
        type: SUBJECT_VIEWER_TYPES.RESET_ANNOTATIONS
    }
}
