import React from 'react';
import PropTypes from 'prop-types';
import {previousStep} from '../actions/task';
import {enterHandler} from './componentUtils';
import {focusTabIndex} from '../utils';
import {getTalkUrl} from '../zooniverse';

class Summary extends React.Component {
    constructor(props) {
        super(props);
        this.handleDoneAndTalk = this.handleDoneAndTalk.bind(this);
        this.handleDone = this.handleDone.bind(this);
        this.handleBack = this.handleBack.bind(this);
    }

    handleDoneAndTalk() {
        this.props.onDone();
    }

    handleDone(e) {
        e.preventDefault();
        this.props.onDone();
    }

    handleBack(e) {
        e.preventDefault();
        this.props.dispatch(previousStep());
    }

    componentDidMount() {
        focusTabIndex(1);
    }

    renderValue(name) {
        const value = this.props.values[name].value;
        const message = (value == '') ? 'BLANK' : value;
        return message;
    }

    renderInstructionGroup(name, title) {
        return (
            <div className="instruction-group">
                <div className="summary-label">{title}</div>
                <div className="summary-answer">
                    {this.renderValue(name)}
                </div>
            </div>
        );
    }

    render() {
        const {subject} = this.props;
        const talkUrl = getTalkUrl(subject.href);

        return (
            <div className="task-container">
                <p className="step-title">Summary</p>
                <div className="task-group">
                    {this.renderInstructionGroup('pressure', 'Pressure')}
                    {this.renderInstructionGroup('dryTemperature', 'Dry bulb temperature')}
                    {this.renderInstructionGroup('wetTemperature', 'Wet bulb temperature')}
                    {this.renderInstructionGroup('maxTemperature', 'Max temperature')}
                    {this.renderInstructionGroup('minTemperature', 'Min temperature')}
                    {this.renderInstructionGroup('rainfall', 'Rainfall')}
                </div>
                <div className="font-weight-bold mb-4">THIS IS A DEMONSTRATION - YOUR CLASSIFICATION WILL NOT BE UPLOADED TO ZOONIVERSE!</div>
                <div className="buttons">
                    <a 
                        className="btn btn-outline-secondary" 
                        href={talkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        tabIndex="3"
                        onClick={this.handleDoneAndTalk}
                    >Done & Talk</a>

                    <div className="float-right">
                        <button 
                            className="btn btn-secondary" 
                            type="button" 
                            title="Back" 
                            tabIndex="2"
                            onClick={this.handleBack} 
                        >Back</button>
     
                        <button 
                            className="btn btn-success" 
                            type="button" 
                            title="Done" 
                            tabIndex="1"
                            onClick={this.handleDone} 
                            onKeyDown={enterHandler(this.handleDone)}
                        >Done</button>
                   </div>
                </div>
            </div>
        );
    }
}


Summary.propTypes = {
    dispatch: PropTypes.func.isRequired,
    locationTitle: PropTypes.string.isRequired,
    values: PropTypes.object.isRequired,
    subject: PropTypes.object.isRequired,
    onDone: PropTypes.func.isRequired
};

export default Summary;
