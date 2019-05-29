import React from 'react';
import PropTypes from 'prop-types';
import {classList} from '../utils';
import {MenuButton, ButtonGroup} from './toolbarButtons';
import {setZoomValue, applyRotation} from '../actions/viewer';
import {setHighlightOn, setHighlightSize} from '../actions/subjectViewer';

const HIGHLIGHT_DELTA = 2;

const ZOOM_OPTIONS = [
    ['fit-width', 'Fit Width'],
    ['fit-height', 'Fit Height'],
    ['actual-size', 'Actual Size']
];

const PERCENTAGE_OPTIONS = [
    [10, false],
    [20, false],
    [30, false],
    [40, false],
    [50, true],
    [60, false],
    [70, false],
    [80, false],
    [90, false],
    [100, true],
    [120, false],
    [140, false],
    [160, false],
    [180, false],
    [200, true],
    [230, false],
    [260, false],
    [290, false],
    [320, false],
    [360, false],
    [400, false],
    [450, false],
    [500, false],
];

export class ZoomControls extends React.Component {
    constructor(props) {
        super(props);
        this.handleZoomOut = this.handleZoomOut.bind(this);
        this.handleZoomIn = this.handleZoomIn.bind(this);
        this.handleZoom = this.handleZoom.bind(this);
    }

    getZoomPercentage() {
        return Math.round(this.props.zoomScale * 100);
    }

    render() {
        const {zoomValue} = this.props;
        const zoomPercentage = this.getZoomPercentage();

        const [minZoom] = PERCENTAGE_OPTIONS[0];
        const [maxZoom] = PERCENTAGE_OPTIONS[PERCENTAGE_OPTIONS.length - 1];

        const zoomOptions = ZOOM_OPTIONS.map(([value, label]) => {
            return <option key={value} value={value}>{label}</option>;
        });

        const percentageOptions = PERCENTAGE_OPTIONS.map(([value, enabled]) => {
            const label = value + '%';
            return <option key={value} value={value} disabled={!enabled} hidden={!enabled}>{label}</option>;
        });

        const options = zoomOptions.concat(percentageOptions);
 
        return (
            <ButtonGroup>
                <MenuButton title="Zoom out" onClick={this.handleZoomOut} disabled={zoomPercentage <= minZoom} iconClass="fa-minus" />
                <MenuButton title="Zoom in" onClick={this.handleZoomIn} disabled={zoomPercentage >= maxZoom} iconClass="fa-plus" />
                <select className="menu-control zoom-select" title="Zoom" value={zoomValue} onChange={this.handleZoom}>
                    {options}
                </select>
            </ButtonGroup>
        );
    }

    applyZoom(zoomValue) {
        this.props.dispatch(setZoomValue(zoomValue));
    }

    handleZoomIn() {
        let zoomValue = '';
        const zoomPercentage = this.getZoomPercentage();

        for (let i = 0; i < PERCENTAGE_OPTIONS.length; i++) {
            const [value] = PERCENTAGE_OPTIONS[i];

            if (value > zoomPercentage) {
                zoomValue = value + '';
                break;
            }
        }

        this.applyZoom(zoomValue);
    }

    handleZoomOut() {
        let zoomValue = '';
        const zoomPercentage = this.getZoomPercentage();

        for (let i = PERCENTAGE_OPTIONS.length - 1; i >= 0; i--) {
            const [value] = PERCENTAGE_OPTIONS[i];

            if (value < zoomPercentage) {
                zoomValue = value + '';
                break;
            }
        }

        this.applyZoom(zoomValue);
    }

    handleZoom(e) {
        this.applyZoom(e.target.value);
    }
}

ZoomControls.propTypes = {
    zoomValue: PropTypes.string.isRequired,
    zoomScale: PropTypes.number.isRequired,
    dispatch: PropTypes.func.isRequired
};

export class RotationControls extends React.Component {
    constructor(props) {
        super(props);
        this.handleRotateClockwise = this.handleRotateClockwise.bind(this);
        this.handleRotateAnticlockwise = this.handleRotateAnticlockwise.bind(this);
    }

    render() {
        return (
            <ButtonGroup>
                <MenuButton title="Rotate anticlockwise" onClick={this.handleRotateAnticlockwise} iconClass="fa-rotate-left" />
                <MenuButton title="Rotate clockwise" onClick={this.handleRotateClockwise} iconClass="fa-rotate-right" />
            </ButtonGroup>
        );
    }

    handleRotateClockwise() {
        this.props.dispatch(applyRotation(1));
    }

    handleRotateAnticlockwise() {
        this.props.dispatch(applyRotation(-1));
    }
}

RotationControls.propTypes = {
    dispatch: PropTypes.func.isRequired
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
