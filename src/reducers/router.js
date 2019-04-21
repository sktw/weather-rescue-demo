import {objectAssign} from '../utils';
import {ROUTER_TYPES} from '../actions/router';

const initialState = {
    route: ''
};

function navigate(state, action) {
    return objectAssign({}, state, {route: action.route});
}

export default (state = initialState, action) => {
    switch (action.type) {
        case ROUTER_TYPES.NAVIGATE:
            return navigate(state, action);

        default:
            return state;
    }
}
