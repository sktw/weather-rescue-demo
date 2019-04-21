import {expect} from 'chai';
import * as Validators from '../src/validators';
import {VALUE_TYPES} from '../src/values';

describe('pressure validator', () => {

    it('should return empty errors for valid partial values', () => {
        const validator = Validators.validators[VALUE_TYPES.PRESSURE].partial;
        const values = [
            '',
            '2', '3', '27', '28', '29', '30', '31', '27.', '27.4', '27.45', 
            '?',
            '?2', '?3', '?27', '?28', '?29', '?30', '?31', '?27.', '?27.4', '?27.45'
        ];

        const validated = values.map(value => [value, validator(value)]);
        expect(validated).to.deep.equal(values.map(value => [value, []]));
    });

    it('should return errors for invalid partial values', () => {
        const validator = Validators.validators[VALUE_TYPES.PRESSURE].partial;
        const values = [
            '1', '4', '26', '34', '2.3', '3.1', '35.2', '20.10', '29.234', 'foo',
            '?1', '?4', '?26', '?34', '?35.2', '?20.10', '?29.234', '?foo',
        ];

        const validated = values.map(value => [value, validator(value)]);
        expect(validated).to.deep.equal(values.map(value => [value, ['Does not match expected pattern']]));
    });

    it('should return empty errors for valid full values', () => {
        const validator = Validators.validators[VALUE_TYPES.PRESSURE].full;
        const values = [
            '27.45', 
            '?27.45'
        ];

        const validated = values.map(value => [value, validator(value)]);
        expect(validated).to.deep.equal(values.map(value => [value, []]));
    });

    it('should return errors for invalid full values', () => {
        const validator = Validators.validators[VALUE_TYPES.PRESSURE].full;
        const values = [
            '?',
            '2', '3', '1', '4', '26', '34', '2.3', '3.1', '35.2', '20.10', '29.234', 'foo',
            '?1', '?4', '?26', '?34', '?35.2', '?20.10', '?29.234', '?foo',
        ];

        const validated = values.map(value => [value, validator(value)]);
        expect(validated).to.deep.equal(values.map(value => [value, ['Does not match expected pattern']]));
    });
});

describe('temperature validator', () => {

    it('should return empty errors for valid partial values', () => {
        const validator = Validators.validators[VALUE_TYPES.TEMPERATURE].partial;
        const values = [
            '',
            '0', '2', '27', '104',
            '?',
            '?2', '?27', '?104',
            '-', '-2', '-27', '-104',
            '?-', '?-2', '?-27', '?-104'
        ];

        const validated = values.map(value => [value, validator(value)]);
        expect(validated).to.deep.equal(values.map(value => [value, []]));
    });

    it('should return errors for invalid partial values', () => {
        const validator = Validators.validators[VALUE_TYPES.TEMPERATURE].partial;
        const values = [
            '#2', '*3', '2.3', '04', 'foo',
            '-#2', '-2.3',
            '?#2', '?*3', '?foo'
        ];

        const validated = values.map(value => [value, validator(value)]);
        expect(validated).to.deep.equal(values.map(value => [value, ['Does not match expected pattern']]));
    });

    it('should return empty errors for valid full values', () => {
        const validator = Validators.validators[VALUE_TYPES.TEMPERATURE].full;
        const values = [
            '0', '1', '20', '106',
            '-1', '-20', '-106',
            '?1', '?20', '?106',
            '?-1', '?-20', '?-106'
        ];

        const validated = values.map(value => [value, validator(value)]);
        expect(validated).to.deep.equal(values.map(value => [value, []]));
    });

    it('should return errors for invalid full values', () => {
        const validator = Validators.validators[VALUE_TYPES.TEMPERATURE].full;
        const values = [
            '?',
            '04', '35.2', '20.10', '29.234', 'foo',
            '-?3',
            '?35.2', '?20.10', '?29.234', '?foo'
        ];

        const validated = values.map(value => [value, validator(value)]);
        expect(validated).to.deep.equal(values.map(value => [value, ['Does not match expected pattern']]));
    });
 });

describe('rainfall validator', () => {

    it('should return empty errors for valid partial values', () => {
        const validator = Validators.validators[VALUE_TYPES.RAINFALL].partial;
        const values = [
            '',
            '0', '-', '2', '23', '104', '0.1', '2.1', '12.3', '0.23', '1.45', '20.19',
            '?', 
            '?0', '?-', '?2', '?23', '?104', '?0.1', '?2.1', '?12.3', '?0.23', '?1.45', '?20.19',
        ];

        const validated = values.map(value => [value, validator(value)]);
        expect(validated).to.deep.equal(values.map(value => [value, []]));
    });

    it('should return errors for invalid partial values', () => {
        const validator = Validators.validators[VALUE_TYPES.RAINFALL].partial;
        const values = [
            '29.234', '01', '03.34', 'foo',
            '?29.234', '?foo',
            '-2', '-29.234'
        ];

        const validated = values.map(value => [value, validator(value)]);
        expect(validated).to.deep.equal(values.map(value => [value, ['Does not match expected pattern']]));
    });

    it('should return empty errors for valid full values', () => {
        const validator = Validators.validators[VALUE_TYPES.RAINFALL].full;
        const values = [
            '-', '0', '0.45', '1.34', '12.74',
            '?-', '?0', '?0.45', '?1.34', '?27.45', '?27.45'
        ];

        const validated = values.map(value => [value, validator(value)]);
        expect(validated).to.deep.equal(values.map(value => [value, []]));
    });

    it('should return errors for invalid full values', () => {
        const validator = Validators.validators[VALUE_TYPES.RAINFALL].full;
        const values = [
            '?',
            '29.234', '00.23', '01.20', 'foo',
            '?29.234', '?foo',
            '-2', '-29.234'
        ];

        const validated = values.map(value => [value, validator(value)]);
        expect(validated).to.deep.equal(values.map(value => [value, ['Does not match expected pattern']]));
    });
});
