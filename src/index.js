import React from 'react';
import ReactDOM from 'react-dom';

import {Provider} from 'react-redux';
import createStore from './store';
import Router from './components/Router';

const store = createStore();

ReactDOM.render(
    <Provider store={store}>
        <Router />
    </Provider>,
    document.getElementById('app')
);
