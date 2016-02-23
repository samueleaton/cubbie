'use strict';

var _lodash = require('lodash');

var event = function () {
  var events = {};

  function isStateEvent(evt) {
    return evt === 'STATE_SET' || evt === 'STATE_RESET' || evt === 'STATE_REVERTED' || evt === 'STATE_MODIFIED' || evt === 'STATE_PROBED';
  }
  function on(evt, cb) {
    if (!_.isArray(events[evt])) events[evt] = [];
    events[evt].push(cb);
  }
  function emit(evt) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (!events[evt]) return;
    if (isStateEvent(evt)) {
      (0, _lodash.each)(events[evt], function (cb) {
        return cb.apply(undefined, [currentState()].concat(args));
      });
    } else {
      (function () {
        var tempState = Object.assign({}, currentState());
        (0, _lodash.each)(events[evt], function (cb) {
          return cb.apply(undefined, [tempState].concat(args));
        });
        setState(tempState);
      })();
    }
  }
  return { on: on, emit: emit };
}();

var states = [];

function currentState() {
  return Object.assign({}, states[states.length - 1]);
}
function resetState() {
  states.splice(1);
  event.emit('STATE_RESET');
}
function revertState(n) {
  if (states.length > 1) states.pop();
  // recursively revert state
  if (typeof n === 'number' && n > 1) revertState(n - 1);else event.emit('STATE_REVERTED');
}
function modifyState(func) {
  var tempState = Object.assign({}, currentState());
  func(tempState);
  setState(tempState);
  event.emit('STATE_MODIFIED');
}
function previousState() {
  if (states.length <= 2) return Object.assign({}, states[1]);else return Object.assign({}, states[states.length - 2]);
}
function setInitialState(obj) {
  states[0] = obj;
  event.emit('STATE_SET');
}
function setState(obj) {
  states.push(obj);
}
function stateHistory() {
  return states.map(function (x) {
    return x;
  });
}

var store = {
  currentState: currentState,
  previousState: previousState,
  resetState: resetState,
  revertState: revertState,
  modifyState: modifyState,
  setInitialState: setInitialState,
  stateHistory: stateHistory,
  on: event.on,
  emit: event.emit
};

Object.defineProperty(store, 'state', {
  get: function get() {
    return store.currentState();
  },
  set: function set(cb) {
    store.modifyState(cb);
  }
});

module.exports = store;

