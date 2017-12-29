import { schema } from 'normalizr';
import Querier from './Querier';
import Mutator from './Mutator';
import { isEnum } from './Enum';

const $isModelProp = `$isModel${Date.now()}`;

export function isModel(sth) {
  return !!sth[$isModelProp];
}

function isScalarType(type) {
  if (type instanceof Array) {
    return isScalarType(type[0]);
  }
  return type === String ||
    type === Number ||
    type === Boolean ||
    type === Function ||
    type === Object ||
    type === Array ||
    type === Symbol ||
    isEnum(type);
}

function isModelOrModelArray(type) {
  if (type instanceof Array) {
    return isModel(type[0]);
  }
  return isModel(type);
}

export function defineModel(tableName, fieldDefs = {}, options = {}) {
  let $properties = {};
  let $relations = {};
  let $normalizrDefinition = {};
  let $primaryKey = null;
  Object.keys(fieldDefs).forEach((fieldName) => {
    let type = fieldDefs[fieldName];
    if (isScalarType(type)) {
      $properties[fieldName] = type;
    } else if (isModelOrModelArray(type)) {
      $relations[fieldName] = type;
      $normalizrDefinition[fieldName] = type.$normalizrEntity;
    } else if (type.scalar && type.primary) {
      $properties[fieldName] = type.scalar;
      if ($primaryKey) {
        console.error('Model can have up to only one field as primary');
      } else {
        $primaryKey = fieldName;
      }
    }
  });
  let $normalizrEntity = new schema.Entity(tableName, $normalizrDefinition, {
    idAttribute: $primaryKey,
  });

  function Model(stateOrDispatch) {
    if (!stateOrDispatch) {
      return Model;
    }
    if (typeof stateOrDispatch === 'function') {
      // dispatch
      return new Mutator(stateOrDispatch, Model);
    }
    // state
    return new Querier(stateOrDispatch, Model);
  }

  Model.define = function define(fields = {}) {
    Object.keys(fields).forEach((fieldName) => {
      let type = fields[fieldName];
      if (isScalarType(type)) {
        $properties[fieldName] = type;
      } else if (isModelOrModelArray(type)) {
        $relations[fieldName] = type;
        $normalizrEntity.define({ [fieldName]: type.$normalizrEntity });
      }
    });
  };

  Object.defineProperty(Model, $isModelProp, {
    value: true,
    writable: false,
    enumerable: false,
  });
  Object.defineProperty(Model, 'tableName', {
    value: tableName,
    writable: false,
  });
  Object.defineProperty(Model, 'properties', {
    get() {
      return $properties;
    },
  });
  Object.defineProperty(Model, 'relations', {
    get() {
      return $relations;
    },
  });
  Object.defineProperty(Model, '$normalizrEntity', {
    value: $normalizrEntity,
    writable: false,
    enumerable: false,
  });

  return Object.seal(Model);
}
