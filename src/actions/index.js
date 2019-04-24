import * as SubjectActions from './subject';
import * as WorkflowActions from './workflow';
import * as ClassificationActions from './classification';
import * as ImageActions from './image';
import * as TaskActions from './task';
import * as ViewerActions from './viewer';
import * as ProjectActions from './project';

export function initialLoad() {
    return (dispatch, getState) => {
        return dispatch(ProjectActions.fetchProject())
            .then(() => {
                return dispatch(WorkflowActions.fetchActiveWorkflows());
            })
            .then(() => {
                const {workflow} = getState();
                if (workflow.status === WorkflowActions.WORKFLOW_STATUS.ACTIVE_WORKFLOWS_EMPTY) {
                    return Promise.resolve();
                }
                else {
                    const activeWorkflows = workflow.activeWorkflows;
                    // TODO - choose random workflow?

                    return dispatch(selectWorkflow(activeWorkflows[0].id));
                }
            })
            .catch(error => console.error(error));
    }
}

export function selectWorkflow(id) {
    return (dispatch, getState) => {
        dispatch(TaskActions.reset());
        dispatch(ViewerActions.reset());
        dispatch(WorkflowActions.setWorkflow(id));

        return dispatch(WorkflowActions.fetchWorkflow())
            .then(() => {
                const {workflow} = getState();
                const currentWorkflow = workflow.currentWorkflow; 
                // TODO - check that currentWorkflow is still active
                // if not, call initial load to repopulate the list

                dispatch(TaskActions.setLocationTitle(currentWorkflow));

                const subjectSets = currentWorkflow.links.subject_sets;
                // TODO - choose random subjectSet?

                dispatch(SubjectActions.setSubjectSet(subjectSets[0].id));
                
                return dispatch(selectSubject());
            })
            .catch(error => console.error(error));
    }
}

function selectSubject() {
    return (dispatch, getState) => {
        return dispatch(SubjectActions.fetchSubject())
            .then(() => {
                const {subject} = getState();
                return dispatch(ImageActions.fetchImage(subject.currentSubject));
            })
            .then(() => {
                dispatch(ClassificationActions.startClassification());
            })
            .then(() => {
                dispatch(TaskActions.nextStep());
            })
            .catch(error => console.error(error));
    }
}

export function classificationCompleted() {
    return (dispatch, getState) => {
        const {task} = getState();
        const annotations = TaskActions.getAnnotations(task);

        dispatch(ClassificationActions.completeClassification(annotations));
        return dispatch(ClassificationActions.submitClassification())
            .then(() => {
                dispatch(TaskActions.nextSubject());
                return dispatch(selectSubject());
            })
            .catch(error => console.error(error));
    }
}
