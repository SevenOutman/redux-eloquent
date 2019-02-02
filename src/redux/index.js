import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import * as Eloquent from '@/lib';
import Book from '@/redux/eloquent/Book';
import Author from '@/redux/eloquent/Author';

function appReducer(state = {}) {
  return state;
}

const middlewares = [];

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;


const db = new Eloquent.Database('db', [Book, Author]);
Eloquent.useDatabase(db);

const store = createStore(
  combineReducers({
    app: appReducer,
    db: db.getReducer(),
  }),
  composeEnhancers(applyMiddleware(...middlewares)),
);
export default store;

db.start(store);
