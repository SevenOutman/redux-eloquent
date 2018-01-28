import reducer from './reducer';

export const rdbReducer = reducer;
export { REDUCER_NAMESPACE } from './constants';

export {
  defineEnum,
} from './Enum';
export {
  defineModel,
} from './Model';

export function primary(type) {
  if (type === Number || type === String) {
    return {
      scalar: type,
      primary: true,
    };
  }
  console.error('Only Number and String can be set as primary');
  return type;
}

export const id = primary(Number);
