import _ from 'lodash';

class CubbieDescription {
  static doesValueMatchType(value, type) {
    if (_.isArray(type)) {
      if (_.includes(type, 'Array')) {
        if (_.isArray(value))
          return true;
      }
      if (_.includes(type, 'Boolean')) {
        if (_.isBoolean(value))
          return true;
      }
      if (_.includes(type, 'Date')) {
        if (_.isDate(value))
          return true;
      }
      if (_.includes(type, 'Element')) {
        if (_.isElement(value))
          return true;
      }
      if (_.includes(type, 'Null')) {
        if (_.isNull(value))
          return true;
      }
      if (_.includes(type, 'Number')) {
        if (_.isNumber(value))
          return true;
      }
      if (_.includes(type, 'Object')) {
        if (_.isPlainObject(value))
          return true;
      }
      if (_.includes(type, 'RegExp')) {
        if (_.isRegExp(value))
          return true;
      }
      if (_.includes(type, 'String')) {
        if (_.isString(value))
          return true;
      }
      if (_.includes(type, 'Symbol')) {
        if (_.isSymbol(value))
          return true;
      }
      if (_.includes(type, 'Undefined')) {
        if (_.isUndefined(value))
          return true;
      }
      return false;
    }
    else {
      if (type === 'Array') {
        if (!_.isArray(value))
          return false;
      }
      else if (type === 'Boolean') {
        if (!_.isBoolean(value))
          return false;
      }
      else if (type === 'Date') {
        if (!_.isDate(value))
          return false;
      }
      else if (type === 'Element') {
        if (!_.isElement(value))
          return false;
      }
      else if (type === 'Null') {
        if (!_.isNull(value))
          return false;
      }
      else if (type === 'Number') {
        if (!_.isNumber(value))
          return false;
      }
      else if (type === 'Object') {
        if (!_.isPlainObject(value))
          return false;
      }
      else if (type === 'RegExp') {
        if (!_.isRegExp(value))
          return false;
      }
      else if (type === 'String') {
        if (!_.isString(value))
          return false;
      }
      else if (type === 'Symbol') {
        if (!_.isSymbol(value))
          return false;
      }
      else if (type === 'Undefined') {
        if (!_.isUndefined(value))
          return false;
      }
      return true;
    }
  }
  static isCubbieDescription(obj) {
    return (
      obj instanceof CubbieDescription || obj.constructor === CubbieDescription
    );
  }
  constructor(obj) {
    if (!_.isPlainObject(obj)) {
      console.error('Must pass object to "describe"');
    }
    if (!obj.type && !obj.types) {
      console.error('Must specify type or types with "describe"');
      return;
    }
    if (obj.type && obj.types) {
      console.error('Cannot specify both "type" and "types" with "describe"');
      return;
    }
    if (obj.type && _.isString(obj.type)) {
      this.type = obj.type;
    }
    if (obj.types && _.isArray(obj.types)) {
      this.types = obj.types;
    }
    if (!_.isUndefined(obj.values)) {
      if (_.isArray(obj.values)) {
        if (obj.values.length)
          this.values = obj.values;
        else
          console.error('"values" cannot be an empty array in "describe"');
      }
      else
        console.error('"values" must be an array in "describe"');
    }

    this.statePath = [];
  }
}

/* EVENT EMITTER
*/
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
    const args = _.isArray(arg) ? arg : [ arg ] ;
    if (typeof cb !== 'function')
      return console.error('Cubbie Error: Last param to "on" must be of type "function".');
    _.each(args, evt => {
      if (!_.isArray(events[evt]))
        events[evt] = [];
      events[evt].push(cb);
    });
    return store;
  }
  function emit(evt, ...args) {
    if (isStateEvent(evt)) {
      _.each(events[evt], cb => cb(store.currentState(), ...args));
    }
    else if (!events[evt])
      return store;
    else {
      _.each(events[evt], cb => cb(...args));
      return store;
    }
  }
  return {
    on,
    emit,
    stateEvents: () => stateEvents.map(x => x)
  };
})();


/* STORE
*/
const store = (function() {
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
    event.emit('STATE_RESET');
    return cubbie;
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
      event.emit('STATE_REVERTED');

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
    event.emit('STATE_MODIFIED');
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
    if (frozen) {
      console.error('Cubbie Error: Cubbie is frozen, cannot set initialState again.');
      return null;
    }

    if (!_.isPlainObject(obj)) {
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
    event.emit('STATE_PROBED');
    return cubbie;
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
        if (_.isUndefined(getValueGivenStatePath(currentState(), _.concat(statePath, k))))
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
  function getValueGivenStatePath(obj, objPath) {
    if (objPath.length)
      return getValueGivenStatePath(obj[objPath[0]], objPath.slice(1));
    else
      return obj;
  }

  /*
  */
  function doesStateMatchStateDescription(state) {
    let stateMatchErrors = 0;

    _.each(describedFields, cubbieDescription => {
      const stateVal = getValueGivenStatePath(state, cubbieDescription.statePath);

      if (cubbieDescription.type) {
        let isValidType = CubbieDescription.doesValueMatchType(stateVal, cubbieDescription.type);

        if (!isValidType) {
          stateMatchErrors++;
          console.error(
            'Invalid type. "' + _.last(cubbieDescription.statePath) + '" must be of type ' + cubbieDescription.type
          );
        }
      }

      if (cubbieDescription.types) {
        let isValidType = CubbieDescription.doesValueMatchType(stateVal, cubbieDescription.types);

        if (!isValidType) {
          stateMatchErrors++;
          console.error(
            'Invalid type. "' + _.last(cubbieDescription.statePath) + '" must be of type: ' + cubbieDescription.types.join(' or ')
          );
        }
      }

      if (cubbieDescription.values) {
        if (!_.includes(cubbieDescription.values, stateVal)) {
          console.error(
            'Invalid value. "' + _.last(cubbieDescription.statePath) + '" must be: ' + cubbieDescription.values.join(' or ')
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
    return cubbie;
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

  return {
    describeState,
    describe,
    currentState,
    previousState,
    resetState,
    revertState,
    modifyState,
    getInitialState,
    setInitialState,
    getStaticState,
    setStaticState,
    stateHistory,
    probe,
    freeze
  };
})();


/* CUBBIE
*/
const cubbie = {
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
  get: () => store.currentState()
});

Object.defineProperty(cubbie, 'staticState', {
  get: () => store.getStaticState(),
  set: (obj) => store.setStaticState(obj)
});

Object.defineProperty(cubbie, 'stateEvents', {
  get: () => event.stateEvents(),
});

Object.defineProperty(cubbie, 'previousState', {
  get: () => store.previousState(),
});

Object.defineProperty(cubbie, 'initialState', {
  get: () => store.getInitialState(),
  set: (obj) => store.setInitialState(obj)
});

Object.defineProperty(cubbie, 'stateHistory', {
  get: () => store.stateHistory(),
});

module.exports = cubbie;
