import { createSelector } from 'reselect';
import { rdbEntitiesSelector, rdbResultSelector } from './selectors';

class Querier {
  constructor(state, model) {
    this.$state = state;
    this.$model = model;
    this.$withRelations = [];

    this.$entitySelector = createSelector(
      rdbEntitiesSelector,
      entities => entities[model.tableName] || {},
    );
    this.$resultSelector = createSelector(
      rdbResultSelector,
      result => result[model.tableName] || [],
    );

    this.$createFindByIdSelector = ids =>
      createSelector(
        this.$entitySelector,
        (all) => {
          if (ids instanceof Array) {
            return ids.map(id => all[id] || null);
          }
          return all[ids] || null;
        },
      );

    this.$allSelector = createSelector(
      this.$entitySelector,
      all => Object.values(all),
    );

    this.$recentSelector = createSelector(
      this.$resultSelector,
      this.$entitySelector,
      (result, all) => result.map(id => all[id]),
    );
  }

  all() {
    return this.$processResult(this.$allSelector(this.$state));
  }

  recent() {
    return this.$processResult(this.$recentSelector(this.$state));
  }

  find(ids) {
    return this.$processResult(this.$createFindByIdSelector(ids)(this.$state));
  }

  with(field) {
    let parsed = field.split(/\s*,\s*/);
    this.$withRelations = this.$withRelations.concat(parsed);
    return this;
  }

  $injectWithRelations(item) {
    if (!item) {
      return item;
    }
    let relationResults = this.$withRelations.reduce((acc, withQuery) => {
      let segmented = withQuery.split('.', 2);
      const relationField = segmented[0];

      let relationModel = this.$model.relations[relationField];
      if (!relationModel) {
        console.warn(`Cannot find relation "${relationField}" on table "${this.$model.tableName}"`);
        return acc;
      }
      if (relationModel instanceof Array) {
        relationModel = relationModel[0];
      }
      let relationQuerier = relationModel(this.$state);
      if (segmented[1]) {
        relationQuerier = relationQuerier.with(segmented[1]);
      }
      return {
        ...acc,
        [relationField]: relationQuerier.find(item[relationField]),
      };
    }, {});
    return {
      ...item,
      ...relationResults,
    };
  }

  $applyWithRelations(results) {
    if (!this.$withRelations.length) {
      return results;
    }
    if (results instanceof Array) {
      return results.map(item => this.$injectWithRelations(item));
    }
    return this.$injectWithRelations(results);
  }

  $processResult(result) {
    return this.$applyWithRelations(result);
  }
}

export default Querier;
