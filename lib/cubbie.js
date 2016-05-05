'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _CubbieDescription = require('./CubbieDescription');

var _CubbieDescription2 = _interopRequireDefault(_CubbieDescription);

var _eventEmitter = require('./eventEmitter');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
function _resetState() {
  states.splice(1);
  _eventEmitter2.default.emit('STATE_RESET');
}

/*
*/
function _revertState(n) {
  if (typeof n === 'function') return revertStateWhere(n);

  if (states.length > 1) states.pop();else return false;
  // recursively revert state
  if (typeof n === 'number' && n > 1) _revertState(n - 1);else _eventEmitter2.default.emit('STATE_REVERTED');

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

  return _revertState(_historyLength - (index + 1));
}

/*
*/
function _modifyState(func) {
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
  _eventEmitter2.default.emit('STATE_MODIFIED');
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
function _setInitialState(obj) {
  if (frozen) console.error('Cubbie Error: Cubbie is frozen, cannot set initialState again.');

  if (!_lodash2.default.isPlainObject(obj)) return console.error('Cubbie Error: Must assign plain object to initialState.');

  if (describedFields.length) {
    if (!doesStateMatchStateDescription(obj)) return console.warn('Cubbie Warning: Could not set initialState. State does not match state description.');
  }
  states[0] = obj;
  initialStateSet = true;
  _eventEmitter2.default.emit('STATE_SET');
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
function _purgeStateHistory() {
  states.splice(1, states.length - 2);
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
function _probe() {
  _eventEmitter2.default.emit('STATE_PROBED');
}

/*
*/
function _describe(obj) {
  if (!_lodash2.default.isPlainObject(obj)) {
    console.error('Cubbie Error: Must pass object to describe.');
    return null;
  }
  return new _CubbieDescription2.default(obj);
}

/*
*/
function _describeState(stateSlice, objPath) {
  var statePath = _lodash2.default.isArray(objPath) ? objPath : [];
  _lodash2.default.forOwn(stateSlice, function (v, k) {
    if (states.length) {
      if (_lodash2.default.isUndefined(_lodash2.default.get(currentState(), _lodash2.default.concat(statePath, k)))) return console.warn('Cubbie Error: "' + k + '" is not defined in the currentState');
    }

    if (_CubbieDescription2.default.isCubbieDescription(v)) {
      v.statePath = _lodash2.default.concat(statePath, k);
      describedFields.push(v);
    } else if (_lodash2.default.isPlainObject(v)) _describeState(v, _lodash2.default.concat(statePath, k));else console.warn('Cubbie Error: "' + k + '" must be plain object or cubbie.describe() in "describeState"');
  });
}

/*
*/
function doesStateMatchStateDescription(state) {
  var stateMatchErrors = 0;

  _lodash2.default.each(describedFields, function (cubbieDescription) {
    var stateVal = _lodash2.default.get(state, cubbieDescription.statePath);

    if (cubbieDescription.type) {
      var isValidType = _CubbieDescription2.default.doesValueMatchType(stateVal, cubbieDescription.type);

      if (!isValidType) {
        stateMatchErrors++;
        console.error('Invalid type. state.' + cubbieDescription.statePath.join('.') + ' must be of type ' + cubbieDescription.type);
      }
    }

    if (cubbieDescription.types) {
      var _isValidType = _CubbieDescription2.default.doesValueMatchType(stateVal, cubbieDescription.types);

      if (!_isValidType) {
        stateMatchErrors++;
        console.error('Invalid type. state.' + cubbieDescription.statePath.join('.') + ' must be of type: ' + cubbieDescription.types.join(' or '));
      }
    }

    if (cubbieDescription.values) {
      if (!_lodash2.default.includes(cubbieDescription.values, stateVal)) {
        console.error('Invalid value "' + stateVal + '". state.' + cubbieDescription.statePath.join('.') + ' must be: ' + cubbieDescription.values.map(function (desc) {
          if (desc === null) return 'null';else if (desc === undefined) return 'undefined';else if (typeof desc === 'string') return '"' + desc + '"';else return desc;
        }).join(' or '));
        stateMatchErrors++;
      }
    }
  });
  return stateMatchErrors === 0;
}

/*
*/
function _freeze() {
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

/* CUBBIE
*/
var cubbie = {
  describeState: function describeState() {
    _describeState.apply(undefined, arguments);
    return this;
  },
  describe: function describe() {
    return _describe.apply(undefined, arguments);
  },
  resetState: function resetState() {
    _resetState.apply(undefined, arguments);
    return this;
  },
  revertState: function revertState() {
    return _revertState.apply(undefined, arguments);
  },
  purgeStateHistory: function purgeStateHistory() {
    _purgeStateHistory();
    return this;
  },
  modifyState: function modifyState() {
    _modifyState.apply(undefined, arguments);
    return currentState();
  },
  setInitialState: function setInitialState() {
    _setInitialState.apply(undefined, arguments);
    return this;
  },
  probe: function probe() {
    _probe.apply(undefined, arguments);
    return this;
  },
  freeze: function freeze() {
    _freeze.apply(undefined, arguments);
    return this;
  },
  on: function on() {
    _eventEmitter2.default.on.apply(_eventEmitter2.default, arguments);
    return this;
  },
  once: function once() {
    _eventEmitter2.default.once.apply(_eventEmitter2.default, arguments);
    return this;
  },
  emit: function emit() {
    _eventEmitter2.default.emit.apply(_eventEmitter2.default, arguments);
    return this;
  }
};

Object.defineProperty(cubbie, 'state', {
  get: function get() {
    return currentState();
  }
});

Object.defineProperty(cubbie, 'staticState', {
  get: function get() {
    return getStaticState();
  },
  set: function set(obj) {
    return setStaticState(obj);
  }
});

Object.defineProperty(cubbie, 'stateEvents', {
  get: function get() {
    return _eventEmitter2.default.stateEvents();
  }
});

Object.defineProperty(cubbie, 'previousState', {
  get: function get() {
    return previousState();
  }
});

Object.defineProperty(cubbie, 'initialState', {
  get: function get() {
    return getInitialState();
  },
  set: function set(obj) {
    return _setInitialState(obj);
  }
});

Object.defineProperty(cubbie, 'stateHistory', {
  get: function get() {
    return stateHistory();
  }
});

exports.default = cubbie;