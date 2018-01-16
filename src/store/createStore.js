import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import makeRootReducer from './reducers';
import { updateLocation } from './location';
import { autostop } from './middleware.js';

export default (initialState = {}) => {
    // ======================================================
    // Middleware Configuration
    // ======================================================
    const middleware = [thunk, autostop];

    // ======================================================
    // Store Enhancers
    // ======================================================
    const enhancers = [];

    let composeEnhancers = compose;

    if (__DEV__) {
        const composeWithDevToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
        if (typeof composeWithDevToolsExtension === 'function') {
            composeEnhancers = composeWithDevToolsExtension;
        }
    }

    // ======================================================
    // Store Instantiation and HMR Setup
    // ======================================================
    const store = createStore(
        makeRootReducer(),
        initialState,
        composeEnhancers(
            applyMiddleware(...middleware),
            ...enhancers
        )
    );
    store.asyncReducers = {};

    if (module.hot) {
        module.hot.accept('./reducers', () => {
            const reducers = require('./reducers').default;
            store.replaceReducer(reducers(store.asyncReducers));
        });
    }

    ;;; window.store = store;
    return store;
};
