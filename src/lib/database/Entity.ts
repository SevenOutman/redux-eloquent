import * as Redux from 'redux';
import Model from '../model/Model'

export interface Entity {
  name: string
  model: typeof Model
  module: Redux.Reducer<any, any>
}

export default Entity
