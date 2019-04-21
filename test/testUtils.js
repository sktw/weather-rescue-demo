import {objectAssign} from '../src/utils';
import sinon from 'sinon';
import * as ApiClient from '../src/apiClient';

export class ImmutableChecker {
    setState(state) {
        this.state = state;
        this.signature = JSON.stringify(state);
    }

    check() {
        return JSON.stringify(this.state) === this.signature;
    }
}

export function createEvent(attrs) {
    return objectAssign({preventDefault: () => {}}, attrs);
}

export function getChainActions(reducer) {
    return (actions = [], initialState = reducer(undefined, {})) => actions.reduce((state, action) => reducer(state, action), initialState);
}

export function mockApiClient(spec) {
    const stub = sinon.stub(ApiClient.default, 'type');
    stub.callsFake(type => spec[type]);

    return stub;
}
