import each from 'lodash.foreach';
import isArray from 'lodash.isArray';
import cloneDeep from 'lodash.clonedeep';
import findLastIndex from 'lodash.findlastindex';

const event = (function() {
  const events = {};

  const stateEvents = [
    'STATE_SET',
    'STATE_RESET',
    'STATE_REVERTED',
    'STATE_MODIFIED',
    'STATE_PROBED'
  ];

  function isStateEvent(evt) {
    return stateEvents.indexOf(evt) !== -1;
  }
  function on(arg, cb) {
    const args = isArray(arg) ? arg : [ arg ] ;
    if (typeof cb !== 'function')
      return console.error('last param to "on" must be a function');
    each(args, evt => {
      if (!isArray(events[evt]))
        events[evt] = [];
      events[evt].push(cb);
    });
    return store;
  }
  function emit(evt, ...args) {
    if (isStateEvent(evt)) {
      console.log('emit state event: ', evt);
      each(events[evt], cb => cb(currentState(), ...args));
      // emit('ANY_STATE_CHANGE');
    }
    else if (!events[evt])
      return store;
    else {
      const tempState = Object.assign({}, currentState());
      each(events[evt], cb => cb(tempState, ...args));
      setNewState(tempState);
      return store;
    }
  }
  return {
    on,
    emit,
    stateEvents: () => stateEvents.map(x => x)
  };
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
  if (typeof n === 'function')
    return revertStateWhere(n);

  if (states.length > 1)
    states.pop();
  else
    return false;
  // recursively revert state
  if (typeof n === 'number' && n > 1)
    revertState(n - 1);
  else
    event.emit('STATE_REVERTED');
  
  return true; 
}
function revertStateWhere(cb) {
  const _history = stateHistory();
  const _historyLength = _history.length;

  const index = findLastIndex(_history, state => {
    if (cb(state))
      return true;
  });

  if (index === -1) return false;

  return revertState(_historyLength - (index + 1));
}
function modifyState(func) {
  const tempState = cloneDeep(currentState());
  func(tempState);
  setNewState(tempState);
  event.emit('STATE_MODIFIED');
  return currentState();
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
function setNewState(obj) {
  states.push(obj);
}
function stateHistory() {
  return states.map(x => cloneDeep(x));
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
function probe() {
  event.emit('STATE_PROBED');
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
  probe,
  on: event.on,
  emit: event.emit
};

Object.defineProperty(store, 'state', {
  get: () => store.currentState(),
  set: (cb) => {store.modifyState(cb)}
});

Object.defineProperty(store, 'stateEvents', {
  get: () => event.stateEvents(),
});

module.exports = store;
