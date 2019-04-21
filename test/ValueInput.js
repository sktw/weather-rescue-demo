import React from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import sinon from 'sinon';

import './enzymeHelper';
import './windowMock';
import {createEvent} from './testUtils';

import {ValueInput} from '../src/components/ValueInput';
import {beginUpdateValue, endUpdateValue, updateValue} from '../src/actions/task';
import {objectAssign} from '../src/utils';

const baseProps = {
    name: 'pressure',
    tabIndex: 3,
    focused: false,
    value: '',
    partialErrors: [],
    fullErrors: [],
    dispatch: () => {}
};


describe('ValueInput', () => {
    it('test with base props', () => {
        const props = objectAssign({}, baseProps);

        const container = shallow(<ValueInput {...props} />);
        expect(container).prop('className').to.equal('value-group');
    });

    it('test with focused and no value', () => {
        const props = objectAssign({}, baseProps, {value: '', focused: true});
        const container = shallow(<ValueInput {...props} />);
    });

    it('test with focused and edited with no partial errors', () => {
        const props = objectAssign({}, baseProps, {value: '3', focused: true});
        const container = shallow(<ValueInput {...props} />);
        expect(container.find('input')).prop('className').to.equal('form-control value-input');
    });

    it('test with focused and edited with partial errors', () => {
        const props = objectAssign({}, baseProps, {value: '4', focused: true, partialErrors: ['Does not match expected pattern'], fullErrors: ['Does not match expected pattern']});
        const container = shallow(<ValueInput {...props} />);
        expect(container.find('input')).prop('className').to.equal('form-control value-input is-invalid');
    });

    it('test unfocused and edited with full errors', () => {
        const props = objectAssign({}, baseProps, {value: '30', focused: false, partialErrors: [], fullErrors: ['Does not match expected pattern'], });
        const container = shallow(<ValueInput {...props} />);
        expect(container.find('input')).prop('className').to.equal('form-control value-input is-invalid');
    });

    it('test unfocused and edited with no errors', () => {
        const props = objectAssign({}, baseProps, {value: '30.45', focused: false});
        const container = shallow(<ValueInput {...props} />);
        expect(container.find('input')).prop('className').to.equal('form-control value-input is-valid');
    });

    it('selects input on focus', () => {
        const props = objectAssign({}, baseProps);
        const container = shallow(<ValueInput {...props} />);
        const select = sinon.spy();
        const event = createEvent({target: {select, setSelectionRange: () => {}, value: ''}});

        container.find('input').simulate('focus', event);
        expect(select.calledOnce).to.be.true;
    });

    it('selects input on click', () => {
        const props = objectAssign({}, baseProps);
        const container = shallow(<ValueInput {...props} />);
        const select = sinon.spy();

        const event = createEvent({target: {select, setSelectionRange: () => {}, value: ''}});
        container.find('input').simulate('click', event);
        expect(select.calledOnce).to.be.true;
    });

    it('dispatches updateValue when input value changes', () => {
        const dispatch = sinon.spy();
        const props = objectAssign({}, baseProps, {dispatch});
        const container = shallow(<ValueInput {...props} />);

        container.find('input').simulate('change', createEvent({target: {value: '30'}}));
        expect(dispatch.calledOnce).to.be.true;
        expect(dispatch.calledWith(updateValue('pressure', '30'))).to.be.true;
    });

    it('dispatches beginUpdateValue when input is focused', () => {
        const dispatch = sinon.spy();
        const props = objectAssign({}, baseProps, {dispatch});
        const container = shallow(<ValueInput {...props} />);

        const event = createEvent({target: {select: () => {}, setSelectionRange: () => {}, value: ''}});
        container.instance().handleFocus(event);

        expect(dispatch.calledOnce).to.be.true;
        expect(dispatch.calledWith(beginUpdateValue('pressure'))).to.be.true;
    });

    it('calls onBlur when input is blured and edited', () => {
        const dispatch = sinon.spy();
        const props = objectAssign({}, baseProps, {dispatch});
        const container = shallow(<ValueInput {...props} />);
        container.instance().handleBlur(createEvent({}));

        expect(dispatch.calledOnce).to.be.true;
        expect(dispatch.calledWith(endUpdateValue('pressure'))).to.be.true;
    });
});
