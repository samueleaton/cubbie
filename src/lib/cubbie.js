import _ from 'lodash';
import CubbieDescription from './CubbieDescription';
import eventEmitter from './eventEmitter';

const states = [];
let staticStateObj = {};
const describedFields = [];
const keyTree = {};
let frozen = false;
let initialStateSet = false;

/*
*/
function currentState() {
  return _.cloneDeep(states[states.length - 1]);
}

/*
*/
function resetState() {
  states.splice(1);
  eventEmitter.emit('STATE_RESET');
}

/*
*/
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
    eventEmitter.emit('STATE_REVERTED');

  return true;
}

/*
*/
function revertStateWhere(cb) {
  const _history = stateHistory();
  const _historyLength = _history.length;

  const index = _.findLastIndex(_history, state => {
    if (cb(state))
      return true;
  });

  if (index === -1) return false;

  return revertState(_historyLength - (index + 1));
}

/*
*/
function modifyState(func) {
  const tempState = currentState();
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
  eventEmitter.emit('STATE_MODIFIED');
  return currentState();
}

/*
*/
function previousState() {
  if (states.length <= 2)
    return Object.assign({}, states[1]);
  else
    return Object.assign({}, states[states.length - 2]);
}

/*
*/
function getInitialState(obj) {
  return _.cloneDeep(states[0]);
}

/*
*/
function setInitialState(obj) {
  if (frozen)
    console.error('Cubbie Error: Cubbie is frozen, cannot set initialState again.');

  if (!_.isPlainObject(obj))
    return console.error('Cubbie Error: Must assign plain object to initialState.');

  if (describedFields.length) {
    if (!doesStateMatchStateDescription(obj))
      return console.warn('Cubbie Warning: Could not set initialState. State does not match state description.');
  }
  states[0] = obj;
  initialStateSet = true;
  eventEmitter.emit('STATE_SET');
}

/*
*/
function setNewState(obj) {
  states.push(obj);
}

/*
*/
function stateHistory() {
  return states.map(x => _.cloneDeep(x));
}

/*
*/
function setStaticState(obj) {
  if (!_.isPlainObject(obj)) {
    console.error('Cubbie Error: Must assign object to staticState.');
    return null;
  }

  staticStateObj = _.cloneDeep(obj);

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
  eventEmitter.emit('STATE_PROBED');
}

/*
*/
function describe(obj) {
  if (!_.isPlainObject(obj)) {
    console.error('Cubbie Error: Must pass object to describe.');
    return null;
  }
  return new CubbieDescription(obj);
}

/*
*/
function describeState(stateSlice, objPath) {
  const statePath = _.isArray(objPath) ? objPath : [] ;
  _.forOwn(stateSlice, (v, k) => {
    if (states.length) {
      if (_.isUndefined(_.get(currentState(), _.concat(statePath, k))))
        return console.warn('Cubbie Error: "' + k + '" is not defined in the currentState');
    }

    if (CubbieDescription.isCubbieDescription(v)) {
      v.statePath = _.concat(statePath, k);
      describedFields.push(v);
    }
    else if (_.isPlainObject(v))
      describeState(v, _.concat(statePath, k));
    else
      console.warn('Cubbie Error: "' + k + '" must be plain object or cubbie.describe() in "describeState"');
  });
}

/*
*/
function doesStateMatchStateDescription(state) {
  let stateMatchErrors = 0;

  _.each(describedFields, cubbieDescription => {
    const stateVal = _.get(state, cubbieDescription.statePath);

    if (cubbieDescription.type) {
      let isValidType = CubbieDescription.doesValueMatchType(stateVal, cubbieDescription.type);

      if (!isValidType) {
        stateMatchErrors++;
        console.error(
          'Invalid type. state.' +
          cubbieDescription.statePath.join('.') +
          ' must be of type ' + cubbieDescription.type
        );
      }
    }

    if (cubbieDescription.types) {
      let isValidType = CubbieDescription.doesValueMatchType(stateVal, cubbieDescription.types);

      if (!isValidType) {
        stateMatchErrors++;
        console.error(
          'Invalid type. state.' +
          cubbieDescription.statePath.join('.') +
          ' must be of type: ' + cubbieDescription.types.join(' or ')
        );
      }
    }

    if (cubbieDescription.values) {
      if (!_.includes(cubbieDescription.values, stateVal)) {
        console.error(
          'Invalid value "' + stateVal + '". state.' +
          cubbieDescription.statePath.join('.') +
          ' must be: ' + cubbieDescription.values.join(' or ')
        );
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
}

/*
*/
function setKeyTree(tree, state) {
  _.forOwn(state, (v, k) => {
    if (_.isObjectLike(v)) {
      tree[k] = {};
      setKeyTree(tree[k], state[k]);
    }
    else {
      tree[k] = true;
    }
  });
}

/*
*/
function wasStateRestructured(tree, state) {
  if (_.isArray(state))
    return false;

  const treeKeys = _.keys(tree);
  const stateKeys = _.keys(state);
  const stateToTreeDifference = _.difference(stateKeys, treeKeys);
  const treeToStateDifference = _.difference(treeKeys, stateKeys);
  let errors = false;

  if (stateToTreeDifference.length) {
    console.warn('Cubbie Warning: Properties added to frozen state: ', stateToTreeDifference);
    errors = true;
    return errors;
  }

  _.forOwn(tree, (v, k) => {
    if (_.isObjectLike(v) && !_.isObjectLike(state[k])) {
      console.warn(
        `Cubbie Warning: Cannot convert frozen array or object to another type.`,
        `Attempted to convert frozen property "${k}" to ${!state[k] ? state[k] : typeof state[k]}`
      );
      console.warn();
      errors = true;
      return;
    }
    if (_.isObjectLike(v)) {
      if (wasStateRestructured(tree[k], state[k])) {
        errors = true;
      }
    }
  });

  if (errors)
    return errors;

  if (treeToStateDifference.length) {
    console.warn('Cubbie Warning: Properties removed from frozen state: ', treeToStateDifference);
    errors = true;
  }

  return errors;
}



/* CUBBIE
*/
const cubbie = {
  describeState(...args) {
    describeState(...args);
    return this;
  },
  describe(...args) {
    return describe(...args);
  },
  resetState(...args) {
    resetState(...args);
    return this;
  },
  revertState(...args) {
    return revertState(...args);
  },
  modifyState(...args) {
    modifyState(...args);
    return currentState();
  },
  setInitialState(...args) {
    setInitialState(...args);
    return this;
  },
  probe(...args) {
    probe(...args);
    return this;
  },
  freeze(...args) {
    freeze(...args);
    return this;
  },
  on(...args) {
    eventEmitter.on(...args);
    return this;
  },
  emit(...args) {
    eventEmitter.emit(...args);
    return this;
  }
};

Object.defineProperty(cubbie, 'state', {
  get: () => currentState()
});

Object.defineProperty(cubbie, 'staticState', {
  get: () => getStaticState(),
  set: (obj) => setStaticState(obj)
});

Object.defineProperty(cubbie, 'stateEvents', {
  get: () => eventEmitter.stateEvents(),
});

Object.defineProperty(cubbie, 'previousState', {
  get: () => previousState(),
});

Object.defineProperty(cubbie, 'initialState', {
  get: () => getInitialState(),
  set: (obj) => setInitialState(obj)
});

Object.defineProperty(cubbie, 'stateHistory', {
  get: () => stateHistory(),
});

export default cubbie;
