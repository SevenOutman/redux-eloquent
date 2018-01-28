# redux-eloquent

`redux-eloquent` allows you to query and mutate your `redux` store in ORM style.

## Usage
This simple example assumes you are familiar with using `react` `redux` and `react-redux`.
```js
// First of all
import { rdbReducer /*, REDUCER_NAMESPACE */ } from 'redux-eloquent'


createStore({
  // name it 'rdb' or use REDUCER_NAMESPACE constant
  rdb: rdbReducer
})
```
```js
// Your models.js
import { defineModel, primary, id } from 'redux-eloquent'

export const Author = defineModel('authors', {
  id,           // shorthand for id: primary(Number)
  name: String
})

export const Book = defineModel('books', {
  isbn: primary(String),
  title: String,
  author: Author
})
```
```js
// Your dispatch function, e.g. the callback of a request
somehowRequestBooks()
  .then(result => {
      Book(dispatch).save(result)
  })
```
```js
// Your component
function mapState2Props(state) {
  return {
    allBooks: Book(state).all()
  }
}
```
