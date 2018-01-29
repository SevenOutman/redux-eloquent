# redux-eloquent

[![npm](https://img.shields.io/npm/v/redux-eloquent.svg?style=flat-square)](https://www.npmjs.com/package/vue-aplayer)
[![npm](https://img.shields.io/npm/l/redux-eloquent.svg?style=flat-square)](https://github.com/SevenOutman/vue-aplayer/blob/master/LICENSE)
[![devDependency Status](https://img.shields.io/david/dev/SevenOutman/redux-eloquent.svg?style=flat-square)](https://david-dm.org/SevenOutman/vue-aplayer#info=devDependencies)
[![npm](https://img.shields.io/npm/dt/redux-eloquent.svg?style=flat-square)](https://www.npmjs.com/package/vue-aplayer)

Query and mutate your `redux` store in ORM style.

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

## API

### Basic

#### `defineModel(key, fields = {})`

Defines a model structure

- `key` like a 'table name' in your db, defines how `redux-eloquent` recognize this model
- `fields` defines every field on this model and their types
```js
// model.js
import { defineModel, primary, id } from 'redux-eloquent'

export const Publisher = defineModel('publishers', {
  id,           // shorthand for id: primary(Number)
  name: String
})
export const Author = defineModel('authors', {
  id,
  // you can omit a field here if it's not a model
  // name: String
})
export const Book = defineModel('books', {
  // defines a primary field that identifies a model instance
  isbn: primary(String),
  publisher: Publisher,
  author: Author,
  // define a model array field like this
  coauthors: [Author]
})

// you can also add fields afterwards,
// in case several models depends on each other
Author.define({
  books: [Book]
})
```

### Mutator

A model is actually a function, which takes a store state or dispatch function as parameter.

When it takes a dispatch function, it returns a `Mutator` which has following methods.

#### `save(obj)`

Save a model entry. Note this method handles nested data.
- `obj` an `Object` with the structure of model definition
```js
import { Book } from './model.js'

// in your mapDispatch2Props(dispatch) maybe
Book(dispatch).save({
  isbn: 'abcdefg',
  // this will be saved into Author too
  author: {
    id: 15,
    name: 'John'
  }
})
```

#### `saveBatch(array)`

Save an array of model entries.


### Querier

When model takes a store state, it returns a `Querier` which has following methods.

#### `all()`

Retrieves all entries of a model
```js
import { Publisher } from './model.js'

// in your mapState2Props(state) maybe
Publisher(state).all()
```

#### `find(id)`

Retrieves entries by given id (or other primary field values)
- `id` primary field value. if `id` is an array, `find` returns an array of according entries
```js
import { Book } from './model.js'

// in your mapState2Props(state) maybe
Book(state).find('abcdefg')
```

#### `recent()`

Retrieves entries that you added with `save()` method EXPLICITLY, which means
```js
import { Book, Author } from './model.js'

// in your mapState2Props(state) maybe
Book(state).recent() // returns the 'abcdefg' book that you `save()`d earlier
Author(state).recent() // does not return the 'id=15' author nested in that book
```

#### `with(relation)`

In `rdbReducer` there's no nested data, entries of different models are stored separately.
So by default, Querier does not return nested data as well, nested models are represented by their primary field value.

Use `with()` to tell Querier which model fields you want to be retrieved as nested objects.

`with()` return the Querier itself so you can do chaining.
```js
import { Book, Author } from './model.js'

// in your mapState2Props(state) maybe
Book(state).recent() // { isbn: 'abcdefg', author: 15 }
// 'author' is a Book's field's name, not a model key
Book(state).with('author').recent() // { isbn: 'abcdefg', author: { id: 15, name: 'John' }}
```

### Helpers

#### `primary(type)`

Mark a field as primary.
`defineModel()` actually accepts a third parameter as `options`, 
in which you can set a primary field as

```js
import { defineModel } from 'redux-eloquent'
 
const Books = defineModel('books', {
  isbn: String,
  title: String
}, {
  primaryKey: 'isbn'
})
```

With `primary()` helper

```js
import { defineModel, primary } from 'redux-eloquent'

const Books = defineModel('books', {
  isbn: primary(String),
  title: String
})
```

Handy right?

#### `id`

Short hand for `primary(Number)`

### Advanced

#### `bindStateDispatch({ getState, dispatch })`

If you find this `Model(state)` and `Model(dispatch)` term inconvenient, 
you can bind a redux store to `redux-eloquent` and it will use the stores `getState()` and `dispatch`

```js
import { bindStateDispatch, rdbReducer as rdb } from 'redux-eloquent'
import { Book } from './model.js'

const store = createStore(/*...rdb...*/)

bindStateDispatch(store)

// then you can query like this
// more interestingly, you can now use it anywhere in your component, not only in mapState2Props
Book.all()
```
