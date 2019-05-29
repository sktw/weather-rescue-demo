import React from 'react';
import PropTypes from 'prop-types';
import {MenuButton, ToolButton, ButtonGroup, ToolButtonContainer} from './toolbarButtons';
import {resetPan} from '../actions/viewer';
import {TOOL_TYPES, SUBTOOL_TYPES, setTool, setSubTool, resetAnnotations} from '../actions/subjectViewer';
import {classList} from '../utils';
import {px} from './componentUtils';

export class ToolSelector extends React.Component {
    constructor(props) {
        super(props);
        this.handleToolChange = this.handleToolChange.bind(this);
    }

    render() {
        const {tool} = this.props;
        return (
            <ButtonGroup separatorRight>
                <ToolButtonContainer tool={tool} onChange={this.handleToolChange}>
                    <ToolButton title="Pan" value={TOOL_TYPES.PAN} />
                    <ToolButton title="Annotate" value={TOOL_TYPES.ANNOTATE} />
                </ToolButtonContainer>
            </ButtonGroup>
        );
    }

    handleToolChange(tool) {
        this.props.dispatch(setTool(tool));
    }
}

ToolSelector.propTypes = {
    tool: PropTypes.string.isRequired,
    dispatch:  PropTypes.func.isRequired
};

export function Highlighter(props) {
    const {highlight, rotation} = props;

    if (!highlight.on) {
        return null;
    }

    const className = classList([
        ["highlighter", true],
        ["highlighter-horizontal", rotation % 2 === 0],
        ["highlighter-vertical", rotation % 2 === 1]
    ]);

    const size = px(highlight.size);

    const style = rotation % 2 === 0 ? {height: size} : {width: size};

    return (
        <div className={className} style={style}></div>
    );
}

Highlighter.propTypes = {
    rotation: PropTypes.number.isRequired,
    highlight: PropTypes.object.isRequired
}

export class AnnotationTools extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubToolChange = this.handleSubToolChange.bind(this);
        this.handleClearAnnotations = this.handleClearAnnotations.bind(this);
    }

    render() {
        const subTools = SUBTOOL_TYPES.ANNOTATE;
        const {subTool} = this.props;

        return (
            <ButtonGroup>
                <ToolButtonContainer tool={subTool} onChange={this.handleSubToolChange}>
                    <ToolButton title="Line" value={subTools.LINE} iconClass="fa-pencil" />
                    <ToolButton title="Rectangle" value={subTools.RECTANGLE} iconClass="fa-square-o" />
                    <ToolButton title="Move" value={subTools.MOVE} iconClass="fa-arrows" />
                    <ToolButton title="Edit" value={subTools.EDIT} iconClass="fa-mouse-pointer" />
                    <ToolButton title="Delete" value={subTools.DELETE} iconClass="fa-remove" />
                </ToolButtonContainer>
                <MenuButton title="Clear annotations" onClick={this.handleClearAnnotations} iconClass="fa-trash" />
           </ButtonGroup>
        );
    }

    handleSubToolChange(subTool) {
        this.props.dispatch(setSubTool(subTool));
    }

    handleClearAnnotations() {
        this.props.dispatch(resetAnnotations());
    }
}

AnnotationTools.propTypes = {
    subTool: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired
};

export class PanTools extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubToolChange = this.handleSubToolChange.bind(this);
        this.handleResetPan = this.handleResetPan.bind(this);
    }

    render() {
        const subTools = SUBTOOL_TYPES.PAN;
        const {subTool} = this.props;

        return (
            <ButtonGroup>
                <ToolButtonContainer tool={subTool} onChange={this.handleSubToolChange}>
                    <ToolButton title="All" value={subTools.ALL} iconClass="fa-arrows" />
                    <ToolButton title="Vertical" value={subTools.VERTICAL} iconClass="fa-arrows-v" />
                    <ToolButton title="Horizontal" value={subTools.HORIZONTAL} iconClass="fa-arrows-h" />
                </ToolButtonContainer>
                <MenuButton title="Reset pan" onClick={this.handleResetPan} iconClass="fa-bullseye" />
            </ButtonGroup>
        );
    }

    handleSubToolChange(subTool) {
        this.props.dispatch(setSubTool(subTool));
    }

    handleResetPan() {
        this.props.dispatch(resetPan());
    }
}

PanTools.propTypes = {
    subTool: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired
};
