import _cloneDeep from 'lodash/cloneDeep';
import _merge from 'lodash/merge';
import { ACTION_UPDATE_ENTITIES } from './constants';

const initialState = {
  result: {},
  entities: {},
};

export default function (state = initialState, { type, entities = {}, result = {} }) {
  switch (type) {
    case ACTION_UPDATE_ENTITIES:
      return {
        result: {
          ...state.result,
          ...result,
        },
        entities: _merge(_cloneDeep(state.entities), entities),
      };
    default:
      return state;
  }
}
