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
            title: 'One day',
            author: {
                id: 1,
                name: 'haha'
            },
        },
        {
            id: 3,
            title: 'Another day',
            author: {
                id: 1,
                name: 'haha'
            }
        }
    ]
});
Book.insertOrUpdate({
    data: {
        id: 3,
        title: 'Another another day'
    }
})
// Book.deleteAll();
console.log(Author.query().with('books.author').all(), Book.query().with('author').findIn([2, 3]));


ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root') as HTMLElement
);
registerServiceWorker();

