import {createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {createLogger} from 'redux-logger';
import rootReducer from '../reducers';

const middlewares = [thunkMiddleware];

if (process.env.NODE_ENV !== 'production') {
    middlewares.push(createLogger());
}

export default () => createStore(rootReducer, applyMiddleware(...middlewares));
