import {createActionTypes} from '../utils';

export const ROUTER_TYPES = createActionTypes('router', {
    NAVIGATE: 'NAVIGATE'
});

export function navigate(route) {
    window.location.hash = '#' + route;
    
    return {
        type: ROUTER_TYPES.NAVIGATE,
        route
    };
}

