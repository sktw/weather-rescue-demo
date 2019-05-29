import React from 'react';
import PropTypes from 'prop-types';
import {reset} from '../actions/viewer';
import {MenuButton, ButtonGroup} from './toolbarButtons';
import {ZoomControls, RotationControls, HighlightControls} from './imageViewerTools';

class Toolbar extends React.Component {
    constructor(props) {
        super(props);
        this.handleReset = this.handleReset.bind(this);
    }

    render() {
        const {zoomValue, zoomScale, highlight, dispatch} = this.props;

        return (
            <nav className="menu-button-bar">
                <ZoomControls zoomValue={zoomValue} zoomScale={zoomScale} dispatch={dispatch} />
                <RotationControls dispatch={dispatch} />
                <HighlightControls highlight={highlight} dispatch={dispatch} />
                <ButtonGroup>
                    <MenuButton title="Reset all" onClick={this.handleReset} iconClass="fa-refresh" />
                </ButtonGroup>
                {this.props.children}
            </nav>
        );
    }

    handleReset() {
        this.props.dispatch(reset());
    }
}

Toolbar.propTypes = {
    zoomValue: PropTypes.string.isRequired,
    zoomScale: PropTypes.number.isRequired,
    highlight: PropTypes.object.isRequired,
    children: PropTypes.node,
    dispatch: PropTypes.func.isRequired
};

export default Toolbar;
