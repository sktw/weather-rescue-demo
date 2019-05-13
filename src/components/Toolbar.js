import React from 'react';
import PropTypes from 'prop-types';
import {setZoomValue, applyRotation, reset} from '../actions/viewer';
import {MenuButton, ButtonGroup} from './toolbarButtons';

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

class Toolbar extends React.Component {
    constructor(props) {
        super(props);
        this.handleZoomOut = this.handleZoomOut.bind(this);
        this.handleZoomIn = this.handleZoomIn.bind(this);
        this.handleZoom = this.handleZoom.bind(this);
        this.handleRotateClockwise = this.handleRotateClockwise.bind(this);
        this.handleRotateAnticlockwise = this.handleRotateAnticlockwise.bind(this);
        this.handleReset = this.handleReset.bind(this);
    }

    render() {
        const {zoomValue, zoomPercentage} = this.props;

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
            <nav className="menu-button-bar">
                <ButtonGroup>
                    <MenuButton title="Zoom out" onClick={this.handleZoomOut} disabled={zoomPercentage <= minZoom} iconClass="fa-minus" />
                    <MenuButton title="Zoom in" onClick={this.handleZoomIn} disabled={zoomPercentage >= maxZoom} iconClass="fa-plus" />
                    <select className="menu-control zoom-select" title="Zoom" value={zoomValue} onChange={this.handleZoom}>
                        {options}
                    </select>
                </ButtonGroup>
                <ButtonGroup>
                    <MenuButton title="Rotate anticlockwise" onClick={this.handleRotateAnticlockwise} iconClass="fa-rotate-left" />
                    <MenuButton title="Rotate clockwise" onClick={this.handleRotateClockwise} iconClass="fa-rotate-right" />
                </ButtonGroup>
                <ButtonGroup>
                    <MenuButton title="Reset all" onClick={this.handleReset} iconClass="fa-refresh" />
                </ButtonGroup>
                {this.props.children}
            </nav>
        );
    }

    handleZoomIn() {
        var zoomValue = '';

        for (let i = 0; i < PERCENTAGE_OPTIONS.length; i++) {
            const [value] = PERCENTAGE_OPTIONS[i];

            if (value > this.props.zoomPercentage) {
                zoomValue = value + '';
                break;
            }
        }

        this.props.dispatch(setZoomValue(zoomValue));
    }

    handleZoomOut() {
        var zoomValue = '';

        for (let i = PERCENTAGE_OPTIONS.length - 1; i >= 0; i--) {
            const [value] = PERCENTAGE_OPTIONS[i];

            if (value < this.props.zoomPercentage) {
                zoomValue = value + '';
                break;
            }
        }

        this.props.dispatch(setZoomValue(zoomValue));
    }

    handleZoom(e) {
        this.props.dispatch(setZoomValue(e.target.value));
    }

    handleRotateClockwise() {
        this.props.dispatch(applyRotation(1));
    }

    handleRotateAnticlockwise() {
        this.props.dispatch(applyRotation(-1));
    }

    handleReset() {
        this.props.dispatch(reset());
    }
}

Toolbar.propTypes = {
    zoomValue: PropTypes.string.isRequired,
    zoomPercentage: PropTypes.number.isRequired,
    children: PropTypes.node,
    dispatch: PropTypes.func.isRequired
};

export default Toolbar;
