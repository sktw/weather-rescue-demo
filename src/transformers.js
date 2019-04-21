import {VALUE_TYPES} from './values';

function pressureTransformer(string) {
    const zeroInitialRe = /^(\??0)(\d)$/;
    const zeroRestRe = /^(\??0)\.(\d\d\d)$/;
    const re = /^(\??\d\d)(\d)$/;

    if (zeroInitialRe.test(string)) {
        const match = string.match(zeroInitialRe);
        return match[1] + '.' + match[2];
    }
    else if (zeroRestRe.test(string)) {
        return string;
    }
    else if (re.test(string)) {
        const match = string.match(re);
        return match[1] + '.' + match[2];
    }
    else {
        return string;
    }
}

function rainfallTransformer(string) {
    const zeroInitialRe = /^(\??0)(\d)$/;
    const zeroRestRe = /^(\??0)\.(\d\d\d)$/;
    const initialRe = /^(\??\d)(\d)$/;
    const restRe = /^(\??\d+)\.(\d)(\d\d)$/;
    
    if (zeroInitialRe.test(string)) {
        const match = string.match(zeroInitialRe);
        return match[1] + '.' + match[2];
    }
    else if (zeroRestRe.test(string)) {
        return string;
    }
    else if (initialRe.test(string)) {
        const match = string.match(initialRe);
        return match[1] + '.' + match[2];
    }
    else if (restRe.test(string)) {
        const match = string.match(restRe);
        return match[1] + match[2] + '.' + match[3];
    }
    else {
        return string;
    }
}

function createReplacementTransformer(character, replacement) {
    return string => {
        if (string === character) {
            return replacement;
        }
        else {
            return string;
        }
    }
}

function transform(transformers, string) {
    return transformers.reduce((output, transformer) => transformer(output), string);
}

function createTransformers(...args) {
    return string => transform(args, string);
}

const characterTransformers = [
    createReplacementTransformer('+', '?')
];

export const transformers = {
    [VALUE_TYPES.PRESSURE]: createTransformers(pressureTransformer, ...characterTransformers),
    [VALUE_TYPES.TEMPERATURE]: createTransformers(...characterTransformers),
    [VALUE_TYPES.RAINFALL]: createTransformers(rainfallTransformer, ...characterTransformers)
};
