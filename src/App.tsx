import * as React from 'react';
import {connect} from "react-redux";
import './App.css';

import logo from './logo.svg';
import Book from "@/redux/eloquent/Book";

interface Props {
    books: Array<any>
}

class App extends React.Component<Props> {
    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Welcome to React</h1>
                </header>
                <p className="App-intro">
                    To get started, edit <code>src/App.tsx</code> and save to reload.
                </p>
                <ul>
                    {
                        this.props.books.map((book, index) => (
                            <li key={index}>{book.title} by {book.author.name}</li>
                        ))
                    }
                </ul>
                <button onClick={() => {
                    Book.insert({
                        data: {
                            id: 6,
                            author: {
                                id: 4,
                                name: 'wef'
                            }
                        }
                    })
                }}>Add</button>
            </div>
        );
    }
}

export default connect(
    state => ({
        books: Book.query().with('author').all()
    })
)(App);
