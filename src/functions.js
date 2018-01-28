let _getState;
let _dispatch;

export function getStateFunc() {
    return _getState;
}

export function dispatchFunc() {
    return _dispatch;
}

export function bindStateDispatch({ getState, dispatch }) {
    _getState = getState;
    _dispatch = dispatch;
}
