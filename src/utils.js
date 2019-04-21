export function blurTabIndex(tabIndex) {
    const el = document.querySelector("[tabIndex='" + tabIndex + "']");
    if (el) {
        el.blur();
    }
}

export function focusTabIndex(tabIndex) {
    const el = document.querySelector("[tabIndex='" + tabIndex + "']");
    if (el && !el.disabled) {
        el.focus();
    }
}

/*
 * setSelectionRange as well to fix this bug in iOS Safari https://stackoverflow.com/q/3272089
 * 'backward' to return position to start of input
*/

export function selectInput(input) {
    input.select();
    input.setSelectionRange(0, input.value.length, 'backward');
}

// elm-inspired classList
// http://package.elm-lang.org/packages/elm-lang/html/2.0.0/Html-Attributes#classList

export function classList(parts) {
    const classes = parts.reduce((acc, [string, cond]) => {
        if (cond) {
            acc.push(string);
        }
        return acc;
    }, []);

    if (classes.length === 0) {
        return null;
    }
    else {
        return classes.join(' ');
    }
}

export function objectAssign() {
    const target = arguments[0];

    for (let i = 1; i < arguments.length; i++) {
        const source = arguments[i];

        for (let key in source) {
            target[key] = source[key];
        }
    }

    return target;
}

export function filledArray(n, value) {
    // return array of length n filled with value
    let func;

    if (typeof value !== 'function') {
        func = () => value;
    }
    else {
        func = value;
    }

    const array = [];
    for (let i = 0; i < n; i++) {
        array.push(func());
    }

    return array;
}

export function unique(array) {
    // return unique elements in array
    const elems = {}

    return array.filter(elem => {
        if (elems[elem]) {
            return false;
        }
        else {
            elems[elem] = true;
            return true;
        }
    });
}

export function randomChoice(array) {
    if (array.length === 0) {
        return null;
    }
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}

export function inheritReducer(superReducer, subReducer) {
    return function(state, action) {
        if (state === undefined) {
            const superState = superReducer(state, action);
            const subState = subReducer(state, action);
            return objectAssign({}, superState, subState);
        }
        else {
            state = superReducer(state, action);
            return subReducer(state, action);
        }
    };
}

export function sortBy(keyfunc) {
    return function (a, b) {
        const x = keyfunc(a);
        const y = keyfunc(b);
        return (x > y) - (y > x);
    }
}

export function switchOn(value, map) {
    if (map.hasOwnProperty(value)) {
        map[value]();
    }
    else if (map.hasOwnProperty('default')) {
        map['default']();
    }
}

export function cloneArray(array) {
    return array.slice(0);
}

// create action types using a variant on the rules in 
// https://github.com/erikras/ducks-modular-redux

export function createActionTypes(reducer, types) {
    const prefix = reducer + '/';

    const actionTypes = {};
    for (let key in types) {
        actionTypes[key] = prefix + types[key];
    }

    return actionTypes;
}

export function getCurrentDate() {
    return new Date();
}
