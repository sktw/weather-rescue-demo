import React from 'react';
import PropTypes from 'prop-types';
import {classList} from '../utils';
import {MenuButton, ToolButton, ButtonGroup, ToolButtonContainer} from './toolbarButtons';
import {TOOL_TYPES, SUBTOOL_TYPES, setTool, setSubTool, setHighlightOn, setHighlightSize, resetAnnotations, resetPan} from '../actions/subjectViewer';
import {px} from './componentUtils';

const HIGHLIGHT_DELTA = 2;

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

export class HighlightControls extends React.Component {
    constructor(props) {
        super(props);
        this.handleHighlighterSwitch = this.handleHighlighterSwitch.bind(this);
        this.handleExpandHighlighter = this.handleExpandHighlighter.bind(this);
        this.handleShrinkHighlighter = this.handleShrinkHighlighter.bind(this);
    }

    renderHighlighterToggle() {
        const {highlight} = this.props;
        const highlightOn = highlight.on;
        const className = classList([
            ["fa fa-fw", true],
            ["fa-toggle-on", highlightOn],
            ["fa-toggle-off", !highlightOn]
        ]);

        return (
            <label className="menu-switch" htmlFor="highlighter-toggle" title="Toggle highlighter">
                {highlightOn ? "Highlight On" : "Highlight Off"} <i className={className} />
                <input id="highlighter-toggle" type="checkbox" onChange={this.handleHighlighterSwitch} />
            </label>
        );
    }

    render() {
        const {on, size} = this.props.highlight;
        
        return (
            <ButtonGroup separatorRight>
                {this.renderHighlighterToggle()}
                <MenuButton 
                    title="Expand highlighter" 
                    onClick={this.handleExpandHighlighter} 
                    iconClass="fa-expand" 
                    disabled={!on} 
                />
                <MenuButton 
                    title="Shrink highlighter" 
                    onClick={this.handleShrinkHighlighter} 
                    iconClass="fa-compress" 
                    disabled={!on || size === HIGHLIGHT_DELTA} 
                />
           </ButtonGroup>
        );
    }

    handleHighlighterSwitch() {
        const on = this.props.highlight.on;
        this.props.dispatch(setHighlightOn(!on));
    }

    handleExpandHighlighter() {
        const size = this.props.highlight.size;
        this.props.dispatch(setHighlightSize(size + HIGHLIGHT_DELTA));
    }

    handleShrinkHighlighter() {
        const size = this.props.highlight.size;
        this.props.dispatch(setHighlightSize(size - HIGHLIGHT_DELTA));
    }
}

HighlightControls.propTypes = {
    highlight: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
};

export function Highlighter(props) {
    if (!props.highlight.on) {
        return null;
    }

    const style = {height: px(props.highlight.size)};

    return (
        <div className="highlighter" style={style}></div>
    );
}

Highlighter.propTypes = {
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
