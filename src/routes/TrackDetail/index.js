import { injectReducer } from '../../store/reducers';

export default (store) => ({
    path : 'zaznam/:stem',
    getComponent (nextState, cb) {
        require.ensure([], (require) => {
            const container = require('./container.js').default;
            const reducer_module = require('./module.js');
            const reducer = reducer_module.default;
            reducer_module.init(store, nextState.params.stem);
            injectReducer(store, { key: 'track_detail', reducer });
            cb(null, container);
        }, 'track_detail');
    },
});