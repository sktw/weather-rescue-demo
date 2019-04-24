import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import * as Actions from '../actions';
import {TASK_STATUS} from '../actions/task';
import {WORKFLOW_STATUS} from '../actions/workflow';
import {generateSessionId} from '../session';
import Transcribe from './Transcribe';
import Summary from './Summary';
import SubjectViewer from './SubjectViewer';
import WorkflowSelector from './WorkflowSelector';
import {blurTabIndex, focusTabIndex} from '../utils';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {nextTabIndex: -1};
        this.handleSwitchInput = this.handleSwitchInput.bind(this);
        this.handleClassificationCompleted = this.handleClassificationCompleted.bind(this);
    }

    updateTabIndex() {
        const {nextTabIndex} = this.state;

        if (nextTabIndex !== -1) {
            focusTabIndex(nextTabIndex);
            this.setState({nextTabIndex: -1});
        }
    }

    handleSwitchInput(currentTabIndex, nextTabIndex) {
        blurTabIndex(currentTabIndex);
        this.setState({nextTabIndex});
    }

    componentDidUpdate() {
        this.updateTabIndex();        
    }

    componentDidMount() {
        generateSessionId();
        this.props.dispatch(Actions.initialLoad());
    }

    handleClassificationCompleted() {
        this.props.dispatch(Actions.classificationCompleted());
    }

    renderStep() {
        const {taskStatus, locationTitle, values, valuesOk, subject, dispatch} = this.props;

        switch (taskStatus) {
            case TASK_STATUS.INIT:
                return null;

            case TASK_STATUS.TRANSCRIBE:
                return (
                    <Transcribe
                        locationTitle={locationTitle}
                        values={values}
                        valuesOk={valuesOk}
                        dispatch={dispatch}
                        onSwitchInput={this.handleSwitchInput}
                    />
                );
 
            case TASK_STATUS.SUMMARY:
                return (
                    <Summary
                        locationTitle={locationTitle}
                        values={values}
                        subject={subject.currentSubject}
                        dispatch={dispatch}
                        onDone={this.handleClassificationCompleted}
                    />
                );
        }
    }

    renderLoader() {
        return (
            <div className="loader">
                <i className="fa fa-spinner fa-spin fa-fw fa-2x"></i>
            </div>
        );
    }

    render() {
        const {workflowStatus, taskStatus, currentWorkflowId, activeWorkflows, dispatch} = this.props;

        if (workflowStatus === WORKFLOW_STATUS.ACTIVE_WORKFLOWS_EMPTY) {
            return (
                <div className="outer-container"> 
                    <div className="alert alert-secondary" role="alert">
                        {"There are no active workflows available!"}
                    </div>
                </div>
            );
        }
        else {
            return (
                <div className="outer-container">
                    {workflowStatus === WORKFLOW_STATUS.WORKFLOW_READY ?
                        <WorkflowSelector 
                            currentWorkflowId={currentWorkflowId}
                            activeWorkflows={activeWorkflows} 
                            dispatch={dispatch} 
                        /> :
                        null
                    }
                    {taskStatus === TASK_STATUS.INIT ?
                        this.renderLoader() :
                        <div className="main-container">
                            <div className="main-inner-container">
                                <SubjectViewer />
                                {this.renderStep()}
                            </div>
                        </div>
                    }
                </div>
            );
        }
    }
}

App.propTypes = {
    currentWorkflowId: PropTypes.string,
    activeWorkflows: PropTypes.arrayOf(PropTypes.object).isRequired,
    subject: PropTypes.object,
    image: PropTypes.object.isRequired,
    locationTitle: PropTypes.string,
    taskStatus: PropTypes.string.isRequired,
    workflowStatus: PropTypes.string.isRequired,
    values: PropTypes.object.isRequired,
    valuesOk: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired
};

function mapStateToProps(storeState) {
    const {workflow, subject, image, task} = storeState;

    return {
        currentWorkflowId: workflow.currentId,
        activeWorkflows: workflow.activeWorkflows,
        image: image,
        subject: subject,
        taskStatus: task.status,
        workflowStatus: workflow.status,
        locationTitle: task.locationTitle,
        values: {
            pressure: task.pressure,
            dryTemperature: task.dryTemperature,
            wetTemperature: task.wetTemperature,
            maxTemperature: task.maxTemperature,
            minTemperature: task.minTemperature,
            rainfall: task.rainfall
        },
        valuesOk: task.valuesOk
    }
}

export default connect(
    mapStateToProps
)(App);
