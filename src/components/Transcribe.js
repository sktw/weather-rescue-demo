import React from 'react';
import PropTypes from 'prop-types';
import {nextStep} from '../actions/task';
import {enterHandler} from './componentUtils';
import {focusTabIndex} from '../utils';
import ValueInput from './ValueInput';

class Transcribe extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleNext = this.handleNext.bind(this);
    }

    handleKeyDown(e) {
        const code = e.keyCode;

        if (code === 13) {
            e.preventDefault();
            this.props.onSwitchInput(e.target.tabIndex, e.target.tabIndex + 1);
        }
    }

    componentDidMount() {
        focusTabIndex(1);
    }

    handleNext(e) {
        e.preventDefault();
        this.props.dispatch(nextStep());
    }

    renderValueInput(name, tabIndex) {
        const {dispatch, onSwitchInput} = this.props;
        const {value, focused, partialErrors, fullErrors} = this.props.values[name];

        return (
            <ValueInput
                name={name}
                id={`${name}-input`}
                tabIndex={tabIndex}
                value={value}
                focused={focused}
                partialErrors={partialErrors}
                fullErrors={fullErrors}
                onSwitchInput={onSwitchInput}
                dispatch={dispatch}
            />
        );
    }

    renderInstructionGroup(name, tabIndex, title, helpText) {
        return (
            <div className="instruction-group">
                <label htmlFor={`${name}-input`}>{title}</label>
                {this.renderValueInput(name, tabIndex)}
                <small className="form-text text-muted">{helpText}</small>
            </div>
        );
    }

    render() {
        const {locationTitle} = this.props;

        return (
            <div className="task-container">
                <p className="step-title">Please enter data for {locationTitle}</p>
                <div className="task-group" onKeyDown={this.handleKeyDown}> 
                    {this.renderInstructionGroup('pressure', 1, 'Pressure', 'First column')}
                    {this.renderInstructionGroup('dryTemperature', 2, 'Dry bulb temperature', 'Third column')}
                    {this.renderInstructionGroup('wetTemperature', 3, 'Wet bulb temperature', 'Fourth column')}
                    {this.renderInstructionGroup('maxTemperature', 4, 'Max temperature', 'Sixth column')}
                    {this.renderInstructionGroup('minTemperature', 5, 'Min temperature', 'Seventh column')}
                    {this.renderInstructionGroup('rainfall', 6, 'Rainfall', 'Near right hand side')}
                </div>

                <div className="buttons">
                    <button 
                        className="btn btn-success" 
                        type="button" 
                        title="Next" 
                        tabIndex={7}
                        onClick={this.handleNext} 
                        onKeyDown={enterHandler(this.handleNext)}
                    >Next</button>
                </div>
            </div>
        );
    }
}


Transcribe.propTypes = {
    locationTitle: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    values: PropTypes.object.isRequired,
    onSwitchInput: PropTypes.func.isRequired
};

export default Transcribe;
