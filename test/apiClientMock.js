import projectsResponse from './data/projectsResponse';
import workflowsResponseAberdeen from './data/workflowsResponseAberdeen';
import activeWorkflowsResponse from './data/activeWorkflowsResponse';
import subjectsResponse from './data/subjectsResponse';

const apiClient = {
    type: function(type) {
        switch (type) {
            case 'projects':
                return {
                    get: function() {
                        return Promise.resolve(projectsResponse)
                    }
                }
            case 'workflows':
                return {
                    get: function(params) {
                        if (typeof(params) === 'string') {
                            return Promise.resolve(workflowsResponseAberdeen);
                        }
                        else {
                            return Promise.resolve(activeWorkflowsResponse);
                        }
                    }
                }
            case 'subjects/queued':
                return {
                    get: function() {
                        return Promise.resolve(subjectsResponse);
                    }
                }
        }
    }
};

export default apiClient;
