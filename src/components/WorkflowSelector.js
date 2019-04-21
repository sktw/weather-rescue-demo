import React from 'react';
import PropTypes from 'prop-types';
import {selectWorkflow} from '../actions';

class WorkflowSelector extends React.Component {
    constructor(props) {
        super(props);
        this.handleWorkflowChange = this.handleWorkflowChange.bind(this);
    }

    render() {
        const {activeWorkflows, currentWorkflowId} = this.props;

        return (
            <div className="workflow-selector form-inline">
                <div className="form-group">
                    <label htmlFor="workflow-selector">Workflow</label>
                    <select 
                        className="form-control mx-3" 
                        id="workflow-selector" 
                        value={currentWorkflowId}
                        onChange={this.handleWorkflowChange}
                    >
                        {activeWorkflows.map(({id, displayName}) => {
                            return <option key={id} value={id}>{displayName}</option>;
                        })}
                    </select>
                </div>
            </div>
        );
    }

    handleWorkflowChange(e) {
        this.props.dispatch(selectWorkflow(e.target.value));
    }
}

WorkflowSelector.propTypes = {
    currentWorkflowId: PropTypes.string.isRequired,
    activeWorkflows: PropTypes.arrayOf(PropTypes.object).isRequired,
    dispatch: PropTypes.func.isRequired
};

export default WorkflowSelector;
