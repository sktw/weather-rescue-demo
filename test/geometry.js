import {expect} from 'chai';
import {getRotationMatrix, getInverseRotationMatrix, multiplyMatrixMatrix} from '../src/geometry';

function normalizeZero(x) {
    return x === -0 ? 0 : x;
}

function removeNegativeZero(m) {
    const [[a, b, c], [d, e, f]] = m;
    return [
        [normalizeZero(a), normalizeZero(b), normalizeZero(c)],
        [normalizeZero(d), normalizeZero(e), normalizeZero(f)]
    ];
}

describe('rotationMatrix', () => {
    const identity = [[1, 0, 0], [0, 1, 0]];
    const size = [100, 200];

    it('should return reciprocal pair for rotation = 0', () => {
        const matrix = getRotationMatrix(0, size);
        const inverse = getInverseRotationMatrix(0, size);
        const result = multiplyMatrixMatrix(matrix, inverse);
        expect(removeNegativeZero(result)).to.deep.equal(identity);
    });

    it('should return reciprocal pair for rotation = 1', () => {
        const matrix = getRotationMatrix(1, size);
        const inverse = getInverseRotationMatrix(1, size);
        const result = multiplyMatrixMatrix(matrix, inverse);
        expect(removeNegativeZero(result)).to.deep.equal(identity);
    });

    it('should return reciprocal pair for rotation = 2', () => {
        const matrix = getRotationMatrix(2, size);
        const inverse = getInverseRotationMatrix(2, size);
        const result = multiplyMatrixMatrix(matrix, inverse);
        expect(removeNegativeZero(result)).to.deep.equal(identity);
    });

    it('should return reciprocal pair for rotation = 3', () => {
        const matrix = getRotationMatrix(3, size);
        const inverse = getInverseRotationMatrix(3, size);
        const result = multiplyMatrixMatrix(matrix, inverse);
        expect(removeNegativeZero(result)).to.deep.equal(identity);
    });
});


