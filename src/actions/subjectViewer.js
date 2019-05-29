import {createActionTypes} from '../utils';

export const SUBJECT_VIEWER_TYPES = createActionTypes('subjectViewer', {
    SET_TOOL: 'SET_TOOL',
    SET_SUBTOOL: 'SET_SUBTOOL',
    SET_HIGHLIGHT_ON: 'SET_HIGHLIGHT_ON',
    SET_HIGHLIGHT_SIZE: 'SET_HIGHLIGHT_SIZE',
    SET_ANNOTATIONS: 'SET_ANNOTATIONS',
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

export function setAnnotations(annotations) {
    return {
        type: SUBJECT_VIEWER_TYPES.SET_ANNOTATIONS,
        annotations
    }
}

export function resetAnnotations() {
    return {
        type: SUBJECT_VIEWER_TYPES.RESET_ANNOTATIONS
    }
}
