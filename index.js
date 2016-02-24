'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _lodash = require('lodash.foreach');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.isArray');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.clonedeep');

var _lodash6 = _interopRequireDefault(_lodash5);

var _lodash7 = require('lodash.findlastindex');

var _lodash8 = _interopRequireDefault(_lodash7);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var event = function () {
  var events = {};

  function isStateEvent(evt) {
    return evt === 'STATE_SET' || evt === 'STATE_RESET' || evt === 'STATE_REVERTED' || evt === 'STATE_MODIFIED' || evt === 'STATE_PROBED';
  }
  function on(evt, cb) {
    if (!(0, _lodash4.default)(events[evt])) events[evt] = [];
    events[evt].push(cb);
  }
  function emit(evt) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (!events[evt]) return;
    if (isStateEvent(evt)) {
      (0, _lodash2.default)(events[evt], function (cb) {
        return cb.apply(undefined, [currentState()].concat(args));
      });
    } else {
      (function () {
        var tempState = Object.assign({}, currentState());
        (0, _lodash2.default)(events[evt], function (cb) {
          return cb.apply(undefined, [tempState].concat(args));
        });
        setNewState(tempState);
      })();
    }
  }
  return { on: on, emit: emit };
}();

var states = [];
var _staticState = {};

function currentState() {
  return Object.assign({}, states[states.length - 1]);
}
function resetState() {
  states.splice(1);
  event.emit('STATE_RESET');
}
function revertState(n) {
  if (typeof n === 'function') return revertStateWhere(n);

  if (states.length > 1) states.pop();else return false;
  // recursively revert state
  if (typeof n === 'number' && n > 1) revertState(n - 1);else event.emit('STATE_REVERTED');

  return true;
}
function revertStateWhere(cb) {
  var _history = stateHistory();
  var _historyLength = _history.length;

  var index = (0, _lodash8.default)(_history, function (state) {
    if (cb(state)) return true;
  });

  if (index === -1) return false;

  return revertState(_historyLength - (index + 1));
}
function modifyState(func) {
  var tempState = (0, _lodash6.default)(currentState());
  func(tempState);
  setNewState(tempState);
  event.emit('STATE_MODIFIED');
  return currentState();
}
function previousState() {
  if (states.length <= 2) return Object.assign({}, states[1]);else return Object.assign({}, states[states.length - 2]);
}
function setInitialState(obj) {
  states[0] = obj;
  event.emit('STATE_SET');
}
function setNewState(obj) {
  states.push(obj);
}
function stateHistory() {
  return states.map(function (x) {
    return (0, _lodash6.default)(x);
  });
}
function setStaticState(obj) {
  if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') return console.error('must pass object to setStaticState');
  (0, _lodash2.default)(Object.keys(obj), function (k) {
    _staticState[k] = obj[k];
  });
}
function staticState() {
  return Object.assign({}, _staticState);
}
function probe() {
  event.emit('STATE_PROBED');
}

var store = {
  currentState: currentState,
  previousState: previousState,
  resetState: resetState,
  revertState: revertState,
  modifyState: modifyState,
  setInitialState: setInitialState,
  stateHistory: stateHistory,
  staticState: staticState,
  setStaticState: setStaticState,
  probe: probe,
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

