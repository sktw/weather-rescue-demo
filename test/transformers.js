import {expect} from 'chai';
import * as Transformers from '../src/transformers';
import {VALUE_TYPES} from '../src/values';

describe('pressure transformer', () => {
    const transformer = Transformers.transformers[VALUE_TYPES.PRESSURE];

    it('should replace a lone + with a ?', () => {
        expect(transformer('+')).to.equal('?');
    });

    it('should ignore a . in any other location', () => {
        expect(transformer('2.4')).to.equal('2.4');
    });

    it('should add decimal point into three consequetive digits', () => {
        expect(transformer('123')).to.equal('12.3');
        expect(transformer('?123')).to.equal('?12.3');
    });

    it('should add a decimal point after a 0', () => {
        expect(transformer('01')).to.equal('0.1');
        expect(transformer('?01')).to.equal('?0.1');
    });

    it('should not move decimal point if first digit is 0', () => {
        expect(transformer('0.002')).to.equal('0.002');
        expect(transformer('?0.002')).to.equal('?0.002');
    });

});

describe('temperature transformer', () => {
    const transformer = Transformers.transformers[VALUE_TYPES.TEMPERATURE];

    it('should replace a lone + with a ?', () => {
        expect(transformer('+')).to.equal('?');
    });
});

describe('rainfall transformer', () => {
    const transformer = Transformers.transformers[VALUE_TYPES.RAINFALL];

    it('should replace a lone + with a ?', () => {
        expect(transformer('+')).to.equal('?');
    });

    it('should add decimal point to zero', () => {
        expect(transformer('01')).to.equal('0.1');
        expect(transformer('?03')).to.equal('?0.3');
    });

    it('should add decimal point into two consequetive digits', () => {
        expect(transformer('12')).to.equal('1.2');
        expect(transformer('?12')).to.equal('?1.2');
    });

    it('should move digits past decimal point', () => {
        expect(transformer('1.234')).to.equal('12.34');
        expect(transformer('?1.234')).to.equal('?12.34');
        expect(transformer('12.345')).to.equal('123.45');
        expect(transformer('?12.345')).to.equal('?123.45');
    });

    it('should ignore existing decimal points', () => {
        expect(transformer('34.56')).to.equal('34.56');
    });

    it('should not move decimal point if first digit is 0', () => {
        expect(transformer('0.002')).to.equal('0.002');
        expect(transformer('?0.002')).to.equal('?0.002');
    });
});


