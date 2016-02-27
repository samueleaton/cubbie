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

  var _stateEvents = ['STATE_SET', 'STATE_RESET', 'STATE_REVERTED', 'STATE_MODIFIED', 'STATE_PROBED'];

  function isStateEvent(evt) {
    return _stateEvents.indexOf(evt) !== -1;
  }
  function on(arg, cb) {
    var args = (0, _lodash4.default)(arg) ? arg : [arg];
    if (typeof cb !== 'function') return console.error('last param to "on" must be a function');
    (0, _lodash2.default)(args, function (evt) {
      if (!(0, _lodash4.default)(events[evt])) events[evt] = [];
      events[evt].push(cb);
    });
    return store;
  }
  function emit(evt) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (isStateEvent(evt)) {
      (0, _lodash2.default)(events[evt], function (cb) {
        return cb.apply(undefined, [currentState()].concat(args));
      });
    } else if (!events[evt]) return store;else {
      var _ret = function () {
        var tempState = Object.assign({}, currentState());
        (0, _lodash2.default)(events[evt], function (cb) {
          return cb.apply(undefined, [tempState].concat(args));
        });
        setNewState(tempState);
        return {
          v: store
        };
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    }
  }
  return {
    on: on,
    emit: emit,
    stateEvents: function stateEvents() {
      return _stateEvents.map(function (x) {
        return x;
      });
    }
  };
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
function getInitialState(obj) {
  return (0, _lodash6.default)(states[0]);
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
  resetState: resetState,
  revertState: revertState,
  modifyState: modifyState,
  setInitialState: setInitialState,
  probe: probe,
  on: event.on,
  emit: event.emit
};

Object.defineProperty(store, 'state', {
  get: function get() {
    return currentState();
  }
});

Object.defineProperty(store, 'staticState', {
  get: function get() {
    return staticState();
  },
  set: function set(obj) {
    setStaticState(obj);
  }
});

Object.defineProperty(store, 'stateEvents', {
  get: function get() {
    return event.stateEvents();
  }
});

Object.defineProperty(store, 'previousState', {
  get: function get() {
    return previousState();
  }
});

Object.defineProperty(store, 'initialState', {
  get: function get() {
    return getInitialState();
  },
  set: function set(obj) {
    return setInitialState(obj);
  }
});

Object.defineProperty(store, 'stateHistory', {
  get: function get() {
    return stateHistory();
  }
});

module.exports = store;

