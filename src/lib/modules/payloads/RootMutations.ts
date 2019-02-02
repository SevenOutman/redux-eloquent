import Record from '../../data/Record'
import Result from '../../query/contracts/Result'
import State from '../contracts/State'
import PersistOptions from './PersistOptions'

export type Condition = (record: Record) => boolean

export interface $Mutate {
  entity: string
  callback: (state: State) => void
}

export interface New extends PersistOptions {
  entity: string
  result: Result
}

export interface Create extends PersistOptions {
  entity: string
  data: Record | Record[]
  result: Result
}

export interface Insert extends PersistOptions {
  entity: string
  data: Record | Record[]
  result: Result
}

export interface Update extends PersistOptions {
  entity: string
  data: Record | Record[]
  where?: string | number | Condition
  result: Result
}

export interface InsertOrUpdate extends PersistOptions {
  entity: string
  data: Record | Record[]
  result: Result
}

export interface Delete {
  entity: string
  where: string | number | Condition
  result: Result
}

export interface DeleteAll {
  entity: string
}
