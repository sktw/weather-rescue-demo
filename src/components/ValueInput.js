import React from 'react';
import PropTypes from 'prop-types';
import {beginUpdateValue, updateValue, endUpdateValue} from '../actions/task';
import {selectInput, classList} from '../utils';

/*
 * Bug in Edge causes input not to be selected after focus
 * See https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8229660/
 * However, as described in the comment below, the suggested fix triggers unexpected behavior in Chrome
 * This behavior also occurs in Firefox and Edge
 * https://stackoverflow.com/questions/38487059/selecting-all-content-of-text-input-on-focus-in-microsoft-edge#comment64782060_38489919
 *
 * Select after focus works when focus occurs through keypress, but not through mouse click. 
 *
 * Solution:
 * 1. In value input, handle onClick as well as onFocus, and set selection.
*/

export class ValueInput extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    handleChange(e) {
        let value = e.target.value;
        this.props.dispatch(updateValue(this.props.name, value));
    }

    handleFocus(e) {
        selectInput(e.target);
        this.props.dispatch(beginUpdateValue(this.props.name));
    }

    handleBlur() {
        this.props.dispatch(endUpdateValue(this.props.name));
    }

    handleClick(e) {
        // see summary at top of page for details of why this is needed
        selectInput(e.target);
    }

    render() {
        const {id, tabIndex, focused, value, partialErrors, fullErrors} = this.props;

        const isInvalid = (focused && partialErrors.length > 0) || (!focused && fullErrors.length > 0);
        const isValid = !focused && fullErrors.length === 0;

        const className = classList([
            ['form-control value-input', true],
            ['is-invalid', isInvalid],
            ['is-valid', isValid],
        ]);

        const renderTooltip = (focused && partialErrors.length > 0)

        return (
            <div className="value-group">
                <input 
                    id={id}
                    className={className}
                    type="text" 
                    value={value} 
                    tabIndex={tabIndex}
                    onChange={this.handleChange} 
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                    onClick={this.handleClick}
                />
                {renderTooltip ? <div className="invalid-tooltip value-tooltip">{partialErrors.join(', ')}</div> : null}
            </div>
        );
    }
}

ValueInput.propTypes = {
    id: PropTypes.string.isRequired,
    tabIndex: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    fullErrors: PropTypes.arrayOf(PropTypes.string).isRequired,
    partialErrors: PropTypes.arrayOf(PropTypes.string).isRequired,
    focused: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired
};

export default ValueInput;
