import * as Redux from 'redux';
import Container from '../container/Container'
import Database from '../database/Database'

export type Install = (database: Database, options?: Options) => any;

export interface Options {
  namespace?: string
}

export default (database: Database, options: Options = {}) => {

  return (store: Redux.Store<any>): void => {
    Container.register(database)

    database.start(store)
  }
}
