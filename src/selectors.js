import { createSelector } from 'reselect';
import { REDUCER_NAMESPACE } from './constants';

export const rdbSelector = state => state[REDUCER_NAMESPACE];
export const rdbEntitiesSelector = createSelector(
  rdbSelector,
  rdb => rdb.entities,
);
export const rdbResultSelector = createSelector(
  rdbSelector,
  rdb => rdb.result
)
