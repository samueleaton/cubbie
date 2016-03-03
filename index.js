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

var _lodash9 = require('lodash.difference');

var _lodash10 = _interopRequireDefault(_lodash9);

var _lodash11 = require('lodash.isobjectlike');

var _lodash12 = _interopRequireDefault(_lodash11);

var _lodash13 = require('lodash.keys');

var _lodash14 = _interopRequireDefault(_lodash13);

var _lodash15 = require('lodash.forown');

var _lodash16 = _interopRequireDefault(_lodash15);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* EVENT EMITTER
*/
var event = function () {
  var events = {};

  var _stateEvents = ['STATE_SET', 'STATE_RESET', 'STATE_REVERTED', 'STATE_MODIFIED', 'STATE_PROBED'];

  function isStateEvent(evt) {
    return _stateEvents.indexOf(evt) !== -1;
  }
  function on(arg, cb) {
    var args = (0, _lodash4.default)(arg) ? arg : [arg];
    if (typeof cb !== 'function') return console.error('Cubbie Error: Last param to "on" must be of type "function".');
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
        return cb.apply(undefined, [store.currentState()].concat(args));
      });
    } else if (!events[evt]) return store;else {
      (0, _lodash2.default)(events[evt], function (cb) {
        return cb.apply(undefined, args);
      });
      return store;
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

/* STORE
*/
var store = function () {
  var states = [];
  var staticStateObj = {};
  var keyTree = {};
  var frozen = false;
  var initialStateSet = false;

  /**/
  function currentState() {
    return (0, _lodash6.default)(states[states.length - 1]);
  }

  /**/
  function resetState() {
    states.splice(1);
    event.emit('STATE_RESET');
    return cubbie;
  }

  /**/
  function revertState(n) {
    if (typeof n === 'function') return revertStateWhere(n);

    if (states.length > 1) states.pop();else return false;
    // recursively revert state
    if (typeof n === 'number' && n > 1) revertState(n - 1);else event.emit('STATE_REVERTED');

    return true;
  }

  /**/
  function revertStateWhere(cb) {
    var _history = stateHistory();
    var _historyLength = _history.length;

    var index = (0, _lodash8.default)(_history, function (state) {
      if (cb(state)) return true;
    });

    if (index === -1) return false;

    return revertState(_historyLength - (index + 1));
  }

  /**/
  function modifyState(func) {
    var tempState = currentState();
    func(tempState);

    if (frozen && wasStateRestructured(keyTree, tempState)) {
      console.warn('Cubbie Warning: Modification aborted.');
      return currentState();
    }

    setNewState(tempState);
    event.emit('STATE_MODIFIED');
    return currentState();
  }

  /**/
  function previousState() {
    if (states.length <= 2) return Object.assign({}, states[1]);else return Object.assign({}, states[states.length - 2]);
  }

  /**/
  function getInitialState(obj) {
    return (0, _lodash6.default)(states[0]);
  }

  /**/
  function setInitialState(obj) {
    if (frozen) {
      console.error('Cubbie Error: Cubbie is frozen, cannot set initialState again.');
      return null;
    }

    if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') {
      console.error('Cubbie Error: Must assign object to initialState. Instead assigned ' + (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)));
      return null;
    }

    states[0] = obj;
    initialStateSet = true;
    event.emit('STATE_SET');
    return cubbie;
  }

  /**/
  function setNewState(obj) {
    states.push(obj);
  }

  /**/
  function stateHistory() {
    return states.map(function (x) {
      return (0, _lodash6.default)(x);
    });
  }

  /**/
  function setStaticState(obj) {
    if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') {
      console.error('Cubbie Error: Must assign object to staticState. Instead assigned ' + (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)));
      return null;
    }

    (0, _lodash2.default)((0, _lodash16.default)(obj), function (v, k) {
      staticStateObj[k] = v;
    });
    return cubbie;
  }

  /**/
  function getStaticState() {
    return Object.assign({}, staticStateObj);
  }

  /**/
  function probe() {
    event.emit('STATE_PROBED');
    return cubbie;
  }

  /**/
  function freeze() {
    if (!initialStateSet) {
      console.error('Cubbie Error: Cannot freeze state before initialState is set.');
      return null;
    }
    if (frozen) {
      console.error('Cubbie Error: Cubbie is already frozen. Cannot freeze again.');
      return null;
    }

    frozen = true;
    setKeyTree(keyTree, currentState());
    return cubbie;
  }

  /**/
  function setKeyTree(tree, state) {
    (0, _lodash16.default)(state, function (v, k) {
      if ((0, _lodash12.default)(v)) {
        tree[k] = {};
        setKeyTree(tree[k], state[k]);
      } else {
        tree[k] = true;
      }
    });
  }

  /**/
  function wasStateRestructured(tree, state) {
    if ((0, _lodash4.default)(state)) return false;

    var treeKeys = (0, _lodash14.default)(tree);
    var stateKeys = (0, _lodash14.default)(state);
    var stateToTreeDifference = (0, _lodash10.default)(stateKeys, treeKeys);
    var treeToStateDifference = (0, _lodash10.default)(treeKeys, stateKeys);
    var errors = false;

    if (stateToTreeDifference.length) {
      console.warn('Cubbie Warning: Properties added to frozen state: ', stateToTreeDifference);
      errors = true;
      return errors;
    }

    (0, _lodash16.default)(tree, function (v, k) {
      if ((0, _lodash12.default)(v) && !(0, _lodash12.default)(state[k])) {
        console.warn('Cubbie Warning: Cannot convert frozen array or object to another type.', 'Attempted to convert frozen property "' + k + '" to ' + (!state[k] ? state[k] : _typeof(state[k])));
        console.warn();
        errors = true;
        return;
      }
      if ((0, _lodash12.default)(v)) {
        if (wasStateRestructured(tree[k], state[k])) {
          errors = true;
        }
      }
    });

    if (errors) return errors;

    if (treeToStateDifference.length) {
      console.warn('Cubbie Warning: Properties removed from frozen state: ', treeToStateDifference);
      errors = true;
    }

    return errors;
  }

  return {
    currentState: currentState,
    previousState: previousState,
    resetState: resetState,
    revertState: revertState,
    modifyState: modifyState,
    getInitialState: getInitialState,
    setInitialState: setInitialState,
    getStaticState: getStaticState,
    setStaticState: setStaticState,
    probe: probe,
    freeze: freeze
  };
}();

/* CUBBIE
*/
var cubbie = {
  resetState: store.resetState,
  revertState: store.revertState,
  modifyState: store.modifyState,
  setInitialState: store.setInitialState,
  probe: store.probe,
  freeze: store.freeze,
  on: event.on,
  emit: event.emit
};

Object.defineProperty(cubbie, 'state', {
  get: function get() {
    return store.currentState();
  }
});

Object.defineProperty(cubbie, 'staticState', {
  get: function get() {
    return store.getStaticState();
  },
  set: function set(obj) {
    return store.setStaticState(obj);
  }
});

Object.defineProperty(cubbie, 'stateEvents', {
  get: function get() {
    return event.stateEvents();
  }
});

Object.defineProperty(cubbie, 'previousState', {
  get: function get() {
    return store.previousState();
  }
});

Object.defineProperty(cubbie, 'initialState', {
  get: function get() {
    return store.getInitialState();
  },
  set: function set(obj) {
    return store.setInitialState(obj);
  }
});

Object.defineProperty(cubbie, 'stateHistory', {
  get: function get() {
    return store.stateHistory();
  }
});

module.exports = cubbie;

