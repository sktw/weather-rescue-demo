import {combineReducers} from 'redux';
import project from './project';
import workflow from './workflow';
import subject from './subject';
import image from './image';
import classification from './classification';
import task from './task';
import router from './router';
import viewer from './subjectViewer';

export default combineReducers({
    project,
    workflow, 
    subject,
    image,
    classification,
    task,
    router,
    viewer
});
