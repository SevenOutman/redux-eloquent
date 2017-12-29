import { normalize } from 'normalizr';
import { ACTION_UPDATE_ENTITIES } from './constants';

class Mutator {
  constructor(dispatch, model) {
    this.$dispatch = dispatch;
    this.$model = model;
  }

  save(obj) {
    const { entities, result } = normalize(obj, this.$model.$normalizrEntity);
    return this.$dispatch({
      type: ACTION_UPDATE_ENTITIES,
      entities,
      result: { [this.$model.tableName]: result },
    });
  }

  saveBatch(array) {
    const { entities, result } = normalize(array, [this.$model.$normalizrEntity]);
    return this.$dispatch({
      type: ACTION_UPDATE_ENTITIES,
      entities,
      result: { [this.$model.tableName]: result },
    });
  }
}

export default Mutator;
