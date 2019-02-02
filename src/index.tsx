import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import store from '@/redux/index.js';
import App from './App';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import Book from '@/redux/eloquent/Book';
import Author from "@/redux/eloquent/Author";

Book.insert({
    data: [
        {
            id: 2,
            author: {
                id: 1,
                name: 'haha'
            },
        },
        {
            id: 3,
            author: {
                id: 1,
                name: 'haha'
            }
        }
    ]
});

console.log(Author.query().with('books.author').all());

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root') as HTMLElement
);
registerServiceWorker();

