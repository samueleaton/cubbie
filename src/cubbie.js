import each from 'lodash.foreach';
import isArray from 'lodash.isArray';

const event = (function() {
  const events = {};

  function isStateEvent(evt) {
    return (
      evt === 'STATE_SET' ||
      evt === 'STATE_RESET' ||
      evt === 'STATE_REVERTED' ||
      evt === 'STATE_MODIFIED' ||
      evt === 'STATE_PROBED'
    );
  }
  function on(evt, cb) {
    if (!isArray(events[evt]))
      events[evt] = [];
    events[evt].push(cb);
  }
  function emit(evt, ...args) {
    if (!events[evt]) return;
    if (isStateEvent(evt)) {
      each(events[evt], cb => cb(currentState(), ...args));
    }
    else {
      const tempState = Object.assign({}, currentState());
      each(events[evt], cb => cb(tempState, ...args));
      setState(tempState);
    }
  }
  return { on, emit };
})();

const states = [];
const _staticState = {};

function currentState() {
  return Object.assign({}, states[states.length - 1]);
}
function resetState() {
  states.splice(1);
  event.emit('STATE_RESET');
}
function revertState(n) {
  if (states.length > 1)
    states.pop();
  // recursively revert state
  if (typeof n === 'number' && n > 1)
    revertState(n - 1);
  else
    event.emit('STATE_REVERTED');  
}
function modifyState(func) {
  const tempState = Object.assign({}, currentState());
  func(tempState);
  setState(tempState);
  event.emit('STATE_MODIFIED');
}
function previousState() {
  if (states.length <= 2)
    return Object.assign({}, states[1]);
  else
    return Object.assign({}, states[states.length - 2]);
}
function setInitialState(obj) {
  states[0] = obj;
  event.emit('STATE_SET');
}
function setState(obj) {
  states.push(obj);
}
function stateHistory() {
  return states.map(x => x);
}
function setStaticState(obj) {
  if (typeof obj !== 'object')
    return console.error('must pass object to setStaticState');
  each(Object.keys(obj), k => {
    _staticState[k] = obj[k];
  });
}
function staticState() {
  return Object.assign({}, _staticState);
}

const store = {
  currentState,
  previousState,
  resetState,
  revertState,
  modifyState,
  setInitialState,
  stateHistory,
  staticState,
  setStaticState,
  on: event.on,
  emit: event.emit
};

Object.defineProperty(store, 'state', {
  get: () => store.currentState(),
  set: (cb) => {store.modifyState(cb)}
});


module.exports = store;
