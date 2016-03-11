'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CubbieDescription = function () {
  _createClass(CubbieDescription, null, [{
    key: 'doesValueMatchType',
    value: function doesValueMatchType(value, type) {
      if (_lodash2.default.isArray(type)) {
        if (_lodash2.default.includes(type, 'Array')) {
          if (_lodash2.default.isArray(value)) return true;
        }
        if (_lodash2.default.includes(type, 'Boolean')) {
          if (_lodash2.default.isBoolean(value)) return true;
        }
        if (_lodash2.default.includes(type, 'Date')) {
          if (_lodash2.default.isDate(value)) return true;
        }
        if (_lodash2.default.includes(type, 'Element')) {
          if (_lodash2.default.isElement(value)) return true;
        }
        if (_lodash2.default.includes(type, 'Null')) {
          if (_lodash2.default.isNull(value)) return true;
        }
        if (_lodash2.default.includes(type, 'Number')) {
          if (_lodash2.default.isNumber(value)) return true;
        }
        if (_lodash2.default.includes(type, 'Object')) {
          if (_lodash2.default.isPlainObject(value)) return true;
        }
        if (_lodash2.default.includes(type, 'RegExp')) {
          if (_lodash2.default.isRegExp(value)) return true;
        }
        if (_lodash2.default.includes(type, 'String')) {
          if (_lodash2.default.isString(value)) return true;
        }
        if (_lodash2.default.includes(type, 'Symbol')) {
          if (_lodash2.default.isSymbol(value)) return true;
        }
        if (_lodash2.default.includes(type, 'Undefined')) {
          if (_lodash2.default.isUndefined(value)) return true;
        }
        return false;
      } else {
        if (type === 'Array') {
          if (!_lodash2.default.isArray(value)) return false;
        } else if (type === 'Boolean') {
          if (!_lodash2.default.isBoolean(value)) return false;
        } else if (type === 'Date') {
          if (!_lodash2.default.isDate(value)) return false;
        } else if (type === 'Element') {
          if (!_lodash2.default.isElement(value)) return false;
        } else if (type === 'Null') {
          if (!_lodash2.default.isNull(value)) return false;
        } else if (type === 'Number') {
          if (!_lodash2.default.isNumber(value)) return false;
        } else if (type === 'Object') {
          if (!_lodash2.default.isPlainObject(value)) return false;
        } else if (type === 'RegExp') {
          if (!_lodash2.default.isRegExp(value)) return false;
        } else if (type === 'String') {
          if (!_lodash2.default.isString(value)) return false;
        } else if (type === 'Symbol') {
          if (!_lodash2.default.isSymbol(value)) return false;
        } else if (type === 'Undefined') {
          if (!_lodash2.default.isUndefined(value)) return false;
        }
        return true;
      }
    }
  }, {
    key: 'isCubbieDescription',
    value: function isCubbieDescription(obj) {
      return obj instanceof CubbieDescription || obj.constructor === CubbieDescription;
    }
  }]);

  function CubbieDescription(obj) {
    _classCallCheck(this, CubbieDescription);

    if (!_lodash2.default.isPlainObject(obj)) {
      console.error('Must pass object to "describe"');
    }
    if (!obj.type && !obj.types && !obj.values) {
      console.error('Must specify type, types, or values with "describe"');
      return;
    }
    if (obj.type && obj.types) {
      console.error('Cannot specify both "type" and "types" with "describe"');
      return;
    }
    if (obj.type && _lodash2.default.isString(obj.type)) {
      this.type = obj.type;
    }
    if (obj.types && _lodash2.default.isArray(obj.types)) {
      this.types = obj.types;
    }
    if (!_lodash2.default.isUndefined(obj.values)) {
      if (_lodash2.default.isArray(obj.values)) {
        if (obj.values.length) this.values = obj.values;else console.error('"values" cannot be an empty array in "describe"');
      } else console.error('"values" must be an array in "describe"');
    }

    this.statePath = [];
  }

  return CubbieDescription;
}();

/* EVENT EMITTER
*/


var event = function () {
  var events = {};

  var _stateEvents = ['STATE_SET', 'STATE_RESET', 'STATE_REVERTED', 'STATE_MODIFIED', 'STATE_PROBED'];

  function isStateEvent(evt) {
    return _stateEvents.indexOf(evt) !== -1;
  }
  function on(arg, cb) {
    var args = _lodash2.default.isArray(arg) ? arg : [arg];
    if (typeof cb !== 'function') return console.error('Cubbie Error: Last param to "on" must be of type "function".');
    _lodash2.default.each(args, function (evt) {
      if (!_lodash2.default.isArray(events[evt])) events[evt] = [];
      events[evt].push(cb);
    });
    return store;
  }
  function emit(evt) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (isStateEvent(evt)) {
      _lodash2.default.each(events[evt], function (cb) {
        return cb.apply(undefined, [store.currentState()].concat(args));
      });
    } else if (!events[evt]) return store;else {
      _lodash2.default.each(events[evt], function (cb) {
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
  var describedFields = [];
  var keyTree = {};
  var frozen = false;
  var initialStateSet = false;

  /*
  */
  function currentState() {
    return _lodash2.default.cloneDeep(states[states.length - 1]);
  }

  /*
  */
  function resetState() {
    states.splice(1);
    event.emit('STATE_RESET');
    return cubbie;
  }

  /*
  */
  function revertState(n) {
    if (typeof n === 'function') return revertStateWhere(n);

    if (states.length > 1) states.pop();else return false;
    // recursively revert state
    if (typeof n === 'number' && n > 1) revertState(n - 1);else event.emit('STATE_REVERTED');

    return true;
  }

  /*
  */
  function revertStateWhere(cb) {
    var _history = stateHistory();
    var _historyLength = _history.length;

    var index = _lodash2.default.findLastIndex(_history, function (state) {
      if (cb(state)) return true;
    });

    if (index === -1) return false;

    return revertState(_historyLength - (index + 1));
  }

  /*
  */
  function modifyState(func) {
    var tempState = currentState();
    func(tempState);

    if (frozen && wasStateRestructured(keyTree, tempState)) {
      console.warn('Cubbie Warning: Modification aborted.');
      return currentState();
    }

    if (!doesStateMatchStateDescription(tempState)) {
      console.warn('Cubbie Warning: State does not match description. Modification aborted.');
      return currentState();
    }

    setNewState(tempState);
    event.emit('STATE_MODIFIED');
    return currentState();
  }

  /*
  */
  function previousState() {
    if (states.length <= 2) return Object.assign({}, states[1]);else return Object.assign({}, states[states.length - 2]);
  }

  /*
  */
  function getInitialState(obj) {
    return _lodash2.default.cloneDeep(states[0]);
  }

  /*
  */
  function setInitialState(obj) {
    if (frozen) {
      console.error('Cubbie Error: Cubbie is frozen, cannot set initialState again.');
      return null;
    }

    if (!_lodash2.default.isPlainObject(obj)) {
      console.error('Cubbie Error: Must assign plain object to initialState.');
      return null;
    }

    if (describedFields.length) {
      if (!doesStateMatchStateDescription(obj)) {
        console.warn('Cubbie Warning: Could not set initialState. State does not match state description.');
        return cubbie;
      }
    }
    states[0] = obj;
    initialStateSet = true;
    event.emit('STATE_SET');
    return cubbie;
  }

  /*
  */
  function setNewState(obj) {
    states.push(obj);
  }

  /*
  */
  function stateHistory() {
    return states.map(function (x) {
      return _lodash2.default.cloneDeep(x);
    });
  }

  /*
  */
  function setStaticState(obj) {
    if (!_lodash2.default.isPlainObject(obj)) {
      console.error('Cubbie Error: Must assign object to staticState.');
      return null;
    }

    staticStateObj = _lodash2.default.cloneDeep(obj);

    return cubbie;
  }

  /*
  */
  function getStaticState() {
    return Object.assign({}, staticStateObj);
  }

  /*
  */
  function probe() {
    event.emit('STATE_PROBED');
    return cubbie;
  }

  /*
  */
  function describe(obj) {
    if (!_lodash2.default.isPlainObject(obj)) {
      console.error('Cubbie Error: Must pass object to describe.');
      return null;
    }
    return new CubbieDescription(obj);
  }

  /*
  */
  function describeState(stateSlice, objPath) {
    var statePath = _lodash2.default.isArray(objPath) ? objPath : [];
    _lodash2.default.forOwn(stateSlice, function (v, k) {
      if (states.length) {
        if (_lodash2.default.isUndefined(getValueGivenStatePath(currentState(), _lodash2.default.concat(statePath, k)))) return console.warn('Cubbie Error: "' + k + '" is not defined in the currentState');
      }

      if (CubbieDescription.isCubbieDescription(v)) {
        v.statePath = _lodash2.default.concat(statePath, k);
        describedFields.push(v);
      } else if (_lodash2.default.isPlainObject(v)) describeState(v, _lodash2.default.concat(statePath, k));else console.warn('Cubbie Error: "' + k + '" must be plain object or cubbie.describe() in "describeState"');
    });
  }

  /*
  */
  function getValueGivenStatePath(obj, objPath) {
    if (objPath.length) return getValueGivenStatePath(obj[objPath[0]], objPath.slice(1));else return obj;
  }

  /*
  */
  function doesStateMatchStateDescription(state) {
    var stateMatchErrors = 0;

    _lodash2.default.each(describedFields, function (cubbieDescription) {
      var stateVal = getValueGivenStatePath(state, cubbieDescription.statePath);

      if (cubbieDescription.type) {
        var isValidType = CubbieDescription.doesValueMatchType(stateVal, cubbieDescription.type);

        if (!isValidType) {
          stateMatchErrors++;
          console.error('Invalid type. state.' + cubbieDescription.statePath.join('.') + ' must be of type ' + cubbieDescription.type);
        }
      }

      if (cubbieDescription.types) {
        var isValidType = CubbieDescription.doesValueMatchType(stateVal, cubbieDescription.types);

        if (!isValidType) {
          stateMatchErrors++;
          console.error('Invalid type. state.' + cubbieDescription.statePath.join('.') + ' must be of type: ' + cubbieDescription.types.join(' or '));
        }
      }

      if (cubbieDescription.values) {
        if (!_lodash2.default.includes(cubbieDescription.values, stateVal)) {
          console.error('Invalid value "' + stateVal + '". state.' + cubbieDescription.statePath.join('.') + ' must be: ' + cubbieDescription.values.join(' or '));
          stateMatchErrors++;
        }
      }
    });
    return stateMatchErrors === 0;
  }

  /*
  */
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

  /*
  */
  function setKeyTree(tree, state) {
    _lodash2.default.forOwn(state, function (v, k) {
      if (_lodash2.default.isObjectLike(v)) {
        tree[k] = {};
        setKeyTree(tree[k], state[k]);
      } else {
        tree[k] = true;
      }
    });
  }

  /*
  */
  function wasStateRestructured(tree, state) {
    if (_lodash2.default.isArray(state)) return false;

    var treeKeys = _lodash2.default.keys(tree);
    var stateKeys = _lodash2.default.keys(state);
    var stateToTreeDifference = _lodash2.default.difference(stateKeys, treeKeys);
    var treeToStateDifference = _lodash2.default.difference(treeKeys, stateKeys);
    var errors = false;

    if (stateToTreeDifference.length) {
      console.warn('Cubbie Warning: Properties added to frozen state: ', stateToTreeDifference);
      errors = true;
      return errors;
    }

    _lodash2.default.forOwn(tree, function (v, k) {
      if (_lodash2.default.isObjectLike(v) && !_lodash2.default.isObjectLike(state[k])) {
        console.warn('Cubbie Warning: Cannot convert frozen array or object to another type.', 'Attempted to convert frozen property "' + k + '" to ' + (!state[k] ? state[k] : _typeof(state[k])));
        console.warn();
        errors = true;
        return;
      }
      if (_lodash2.default.isObjectLike(v)) {
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
    describeState: describeState,
    describe: describe,
    currentState: currentState,
    previousState: previousState,
    resetState: resetState,
    revertState: revertState,
    modifyState: modifyState,
    getInitialState: getInitialState,
    setInitialState: setInitialState,
    getStaticState: getStaticState,
    setStaticState: setStaticState,
    stateHistory: stateHistory,
    probe: probe,
    freeze: freeze
  };
}();

/* CUBBIE
*/
var cubbie = {
  describeState: store.describeState,
  describe: store.describe,
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

