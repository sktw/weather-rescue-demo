import React from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import sinon from 'sinon';

import './enzymeHelper';
import {createEvent} from './testUtils';

import WorkflowSelector from '../src/components/WorkflowSelector';
import * as Actions from '../src/actions';
import {objectAssign} from '../src/utils';

const activeWorkflows = [
    {
        "id": "9965",
        "displayName": "BRUSSELS-1",
    },
    {
        "id": "9966",
        "displayName": "PARIS-1",
    },
    {
        "id": "9967",
        "displayName": "STRASBOURG-1",
    },
    {
        "id": "9968",
        "displayName": "LYONS-1",
    },
    {
        "id": "9969",
        "displayName": "TOULON-1",
    }
];

const baseProps = {
    currentWorkflowId: '9968',
    activeWorkflows,
    dispatch: () => {}
};



describe('WorkflowSelector', () => {
    it('test with base props', () => {
        const props = objectAssign({}, baseProps);
        const container = shallow(<WorkflowSelector {...props} />);

        const selects = container.find('select');
        expect(selects).to.have.length(1);
        const workflowSelect = selects.at(0);
        expect(workflowSelect).to.have.value('9968')
    });

    it('dispatches selectWorkflow when year selected', () => {
        const dispatch = sinon.spy();
        const selectWorkflow = sinon.stub(Actions, 'selectWorkflow');

        const props = objectAssign({}, baseProps, {dispatch});
        const container = shallow(<WorkflowSelector {...props} />);

        container.find('select').at(0).simulate('change', createEvent({target: {value: '9969'}}));
        expect(dispatch.calledOnce).to.be.true;
        expect(selectWorkflow.calledOnce).to.be.true;
        expect(selectWorkflow.calledWith('9969')).to.be.true;

        selectWorkflow.restore();
    });
});
