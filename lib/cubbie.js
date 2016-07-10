import _ from 'lodash';
import CubbieDescription from './CubbieDescription';
import EventEmitter from './eventEmitter';
import fileSystem from './fileSystem';
import CubbieState from './CubbieState';
import cleanStore from './cleanStore';
import { diff } from 'deep-diff';
import revertDiffChanges from './revertDiffChanges';
import generateFriendlyStateHistory from './generateFriendlyStateHistory';
import deepFreeze from 'deep-freeze';

/*
*/
function describe(description) {
  if (!_.isPlainObject(description)) {
    console.error('Cubbie Error: Must pass object to describe.');
    return null;
  }
  return new CubbieDescription(description);
}

/*
*/
const createStore = (configObj = {}) => (() => {
  let states = [];
  let staticStateObj = {};
  const describedFields = [];
  const stateConstraints = [];
  const keyTree = {};
  let frozen = false;
  let initialStateSet = false;
  const eventEmitter = new EventEmitter();
  const views = {};

  if (configObj.file) {
    if (!fileSystem.isFsAvailable())
      return console.error('file system is not available in this environment');
    fileSystem.initStorage(configObj);
  }

  /*
  */
  function createStateObject(state, isInitialState) {
    return new CubbieState({ state, isInitialState });
  }

  /*
  */
  function getCurrentState() {
    if (states.length)
      return states[states.length - 1].state;
    else
      return null;
  }

  /*
  */
  function resetState() {
    states.splice(1);
    eventEmitter.emit('STATE_RESET');
  }

  /*
  */
  function revertState(nTimes) {
    if (typeof nTimes === 'function')
      return revertStateWhere(nTimes);

    if (states.length > 1) {
      const curr = states.pop();
      const prev = states[states.length - 1];
      if (states.length > 1)
        states[states.length - 1].state = revertDiffChanges(curr.state, prev.state);
    }
    else
      return false;
    // recursively revert state
    if (typeof nTimes === 'number' && nTimes > 1)
      revertState(nTimes - 1);
    else
      eventEmitter.emit('STATE_REVERTED');

    return true;
  }

  /*
  */
  function revertStateWhere(revertCb) {
    // for future optimization: this shouldn't get whole client history at once,
    // but instead as needed
    const _history = generateFriendlyStateHistory(states);
    const _historyLength = _history.length;

    const index = _.findLastIndex(_history, stateObj => {
      if (revertCb(stateObj))
        return true;
    });

    if (index === -1) return false;

    return revertState(_historyLength - (index + 1));
  }

  /*
  */
  function modifyState(func) {
    const tempState = getCurrentState();
    func(tempState);

    if (frozen && wasStateRestructured(keyTree, tempState)) {
      console.warn('Cubbie Warning: Modification aborted.');
      return getCurrentState();
    }

    if (process && process.env && process.env.NODE_ENV !== 'production') {
      if (describedFields.length && !doesStateMatchStateDescription(tempState)) {
        console.warn('Cubbie Warning: State does not match description. Modification aborted.');
        return getCurrentState();
      }

      if (stateConstraints.length && !doesStatePassStateConstraints(tempState)) {
        console.warn('Cubbie Warning: State does not pass constraint. Modification aborted.');
        return getCurrentState();
      }
    }

    setNewState(tempState);
    eventEmitter.emit('STATE_MODIFIED');
    return getCurrentState();
  }

  /*
  */
  function getPreviousState() {
    if (states.length <= 1)
      return null;
    else if (states.length === 2)
      return _.cloneDeep(states[0].state);
    else {
      const curr = states[states.length - 1];
      const prev = states[states.length - 2];
      return revertDiffChanges(curr.state, prev.state);
    }
  }

  /*
  */
  function getInitialState() {
    if (states.length)
      return _.cloneDeep(states[0].state);
    else
      return null;
  }

  /*
  */
  function setInitialState(initialState) {
    if (frozen)
      console.error('Cubbie Error: Cubbie is frozen, cannot set initialState again.');

    if (!_.isPlainObject(initialState))
      return console.error('Cubbie Error: Must assign plain object to initialState.');

    if (describedFields.length) {
      if (!doesStateMatchStateDescription(initialState)) {
        return console.warn(
          'Cubbie Warning: Could not set initialState. State does not match state description.'
        );
      }
    }

    states[0] = createStateObject(initialState, true);
    initialStateSet = true;
    eventEmitter.emit('STATE_SET');
  }

  /*
  */
  function setNewState(newState) {
    const isInitialState = Boolean(!states.length);
    const stateObj = createStateObject(newState, isInitialState);
    const i = states.length - 1;
    if (!isInitialState && states.length > 1)
      states[i].state = diff(states[i].state, stateObj.state);
    states.push(deepFreeze(stateObj));
  }

  /*
  */
  function purgeStateHistory() {
    states.splice(1, states.length - 2);
  }

  /*
  */
  function setStaticState(staticState) {
    if (!_.isPlainObject(staticState)) {
      console.error('Cubbie Error: Must assign object to staticState.');
      return null;
    }

    staticStateObj = _.cloneDeep(staticState);
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
  function describeState(stateSlice, objPath) {
    const statePath = _.isArray(objPath) ? objPath : [];
    _.forOwn(stateSlice, (val, key) => {
      if (states.length) {
        if (_.isUndefined(_.get(getCurrentState(), _.concat(statePath, key))))
          return console.warn('Cubbie Error: "' + key + '" is not defined in the currentState');
      }

      if (CubbieDescription.isCubbieDescription(val)) {
        val.statePath = _.concat(statePath, key);
        describedFields.push(val);
      }
      else if (_.isPlainObject(val))
        describeState(val, _.concat(statePath, key));
      else {
        console.warn(
          'Cubbie Error: "' + key +
          '" must be plain object or cubbie.describe() in "describeState"'
        );
      }
    });
  }

  /*
  */
  function doesStateMatchStateDescription(state) {
    let stateMatchErrors = 0;

    _.forEach(describedFields, cubbieDescription => {
      const stateVal = _.get(state, cubbieDescription.statePath);

      if (cubbieDescription.type) {
        const isValidType = CubbieDescription.doesValueMatchType(stateVal, cubbieDescription);

        if (!isValidType) {
          stateMatchErrors++;
          if (cubbieDescription.type === 'ARRAY' && _.isArray(stateVal) && cubbieDescription.of) {
            console.error(
              'Invalid type in ' + cubbieDescription.type + ' of ' +
              cubbieDescription.of + '. The value at state.' +
              cubbieDescription.statePath.join('.') +
              ' (' +
              _.find(
                stateVal, val => !CubbieDescription.doesValueMatchType(val, cubbieDescription.of)
              ) +
              ') is not of type ' + cubbieDescription.of
            );
          }
          else {
            console.error(
              'Invalid type. Set state.' +
              cubbieDescription.statePath.join('.') +
              ' = ' + stateVal + ' (' + CubbieDescription.getType(stateVal) +
              '). Must be of type ' + cubbieDescription.type
            );
          }
        }
      }

      if (cubbieDescription.types) {
        const isValidType = CubbieDescription.doesValueMatchType(
          stateVal, cubbieDescription.types
        );

        if (!isValidType) {
          stateMatchErrors++;
          console.error(
            'Invalid type. Set state.' +
            cubbieDescription.statePath.join('.') +
            ' = ' + stateVal + ' (' + CubbieDescription.getType(stateVal) +
            '). Must be of type ' + cubbieDescription.types.join(' or ')
          );
        }
      }

      if (cubbieDescription.values) {
        if (!_.includes(cubbieDescription.values, stateVal)) {
          console.error(
            'Invalid value "' + stateVal + '". state.' +
            cubbieDescription.statePath.join('.') +
            ' must be: ' + cubbieDescription.values.map(desc => {
              if (desc === null) return 'null';
              else if (typeof desc === 'undefined') return 'undefined';
              else if (typeof desc === 'string') return `"${desc}"`;
              else return desc;
            }).join(' or ')
          );
          stateMatchErrors++;
        }
      }
    });
    return stateMatchErrors === 0;
  }


  /*
  */
  function addStateConstraint(constraintName, stateConstraintCb) {
    stateConstraints.push({ name: constraintName, fn: stateConstraintCb });
  }

  /*
  */
  function doesStatePassStateConstraints(state) {
    const constraintErrors = [];
    _.forEach(stateConstraints, stateConstraintObj => {
      if (!stateConstraintObj.fn(_.cloneDeep(state)))
        constraintErrors.push(stateConstraintObj.name);
    });

    if (constraintErrors.length) {
      _.forEach(constraintErrors, constraintName => {
        console.error('Failed constraint: ', constraintName);
      });
      return false;
    }
    else
      return true;
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
    setKeyTree(keyTree, getCurrentState());
  }

  /*
  */
  function setKeyTree(tree, state) {
    _.forOwn(state, (val, key) => {
      if (_.isObjectLike(val)) {
        tree[key] = {};
        setKeyTree(tree[key], state[key]);
      }
      else
        tree[key] = true;
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

    _.forOwn(tree, (val, key) => {
      if (_.isObjectLike(val) && !_.isObjectLike(state[key])) {
        console.warn(
          `Cubbie Warning: Cannot convert frozen array or object to another type.`,
          `Attempted to convert frozen property "${key}" to ${
            state[key] ? typeof state[key] : state[key]
          }`
        );
        console.warn();
        errors = true;
        return;
      }
      if (_.isObjectLike(val) && wasStateRestructured(tree[key], state[key]))
        errors = true;
    });

    if (errors)
      return errors;

    if (treeToStateDifference.length) {
      console.warn('Cubbie Warning: Properties removed from frozen state: ', treeToStateDifference);
      errors = true;
    }

    return errors;
  }

  /*
  */
  function createView(viewName, viewFunction) {
    if (views[viewName])
      return console.error(`view "${viewName}" already exists`);
    if (!_.isFunction(viewFunction))
      return console.error(`second parameter to createView must be a function`);
    views[viewName] = viewFunction;
  }

  /*
  */
  function view(viewName, ...args) {
    if (!views[viewName])
      return console.error(`view "${viewName}" does not exist`);
    return views[viewName](getCurrentState(), ...args);
  }

  /*
  */
  function commitStore(commitConfig = {}) {
    if (!fileSystem.isFsAvailable())
      return console.error('file system is not available in this environment');
    
    if (typeof configObj.file !== 'string')
      return console.error('file path has not been set or is invalid');

    fileSystem.commitStore({
      eventEmitter: eventEmitter,
      stateHistory: states,
      configObj: configObj,
      commitConfig: commitConfig
    });
  }

  /*
  */
  function fetchStore(fetchConfig = {}) {
    if (!fileSystem.isFsAvailable())
      return console.error('file system is not available in this environment');
    if (typeof configObj.file !== 'string')
      return console.error('file path has not been set or is invalid');
    fileSystem.fetchStore(configObj, store => {
      if (!store)
        return console.error('Cubbie Error: Error fetching store');

      const invalidState = _.find(
        store, state => !state || !state.id || !state.timestamp
      );

      if (invalidState)
        return console.error('Cubbie Error: Cannot import. Found invalid state: ', invalidState);

      if (!store.length && !states.length)
        return console.error('Cubbie Error: The current store and fetched stores are empty');

      if (_.isPlainObject(fetchConfig) && fetchConfig.hard === true)
        states = [];

      states = _(states)
        .concat(store)
        .uniqBy(state => state.id)
        .sortBy(state => state.timestamp)
        .map(state => CubbieState.toCubbieState(state))
        .value();

      eventEmitter.emit('STORE_FETCHED');
      return getCurrentState();
    });
  }

  /* Store
  */
  const storeMethods = {
    describeState(...args) {
      describeState(...args);
      return this;
    },
    addStateConstraint(...args) {
      addStateConstraint(...args);
      return this;
    },
    resetState(...args) {
      resetState(...args);
      return this;
    },
    revertState(...args) {
      return revertState(...args);
    },
    purgeStateHistory() {
      purgeStateHistory();
      return this;
    },
    modifyState(...args) {
      modifyState(...args);
      return getCurrentState();
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
    setEventNamespace(...args) {
      eventEmitter.setEventNamespace(...args);
      return this;
    },
    once(...args) {
      eventEmitter.once(...args);
      return this;
    },
    off(...args) {
      eventEmitter.off(...args);
      return this;
    },
    emit(...args) {
      eventEmitter.emit(...args);
      return this;
    },
    createView(...args) {
      createView(...args);
      return this;
    },
    view(...args) {
      return view(...args);
    },
    commit(...args) {
      commitStore(...args);
      return this;
    },
    fetch(...args) {
      fetchStore(...args);
      return this;
    },
    eventLogging: {
      enable: storeName => {
        if (storeName && !_.isString(storeName))
          return console.error('Cubbie Error: invalid param passed to eventLogging.enable');
        eventEmitter.enableEventLogging(storeName);
      },
      disable: () => {
        eventEmitter.disableEventLogging();
      }
    },
    clean() {
      cleanStore(states, generateFriendlyStateHistory(states));
      return this;
    }
  };

  Object.defineProperty(storeMethods, 'state', {
    get: () => getCurrentState()
  });

  Object.defineProperty(storeMethods, 'staticState', {
    get: () => getStaticState(),
    set: staticState => setStaticState(staticState)
  });

  Object.defineProperty(storeMethods, 'stateEvents', {
    get: () => eventEmitter.stateEvents
  });

  Object.defineProperty(storeMethods, 'previousState', {
    get: () => getPreviousState()
  });

  Object.defineProperty(storeMethods, 'initialState', {
    get: () => getInitialState(),
    set: initialState => setInitialState(initialState)
  });

  Object.defineProperty(storeMethods, 'stateDescription', {
    get: () => _.map(describedFields, field => field),
    set: stateDescription => describeState(stateDescription)
  });

  Object.defineProperty(storeMethods, 'stateHistory', {
    get: () => generateFriendlyStateHistory(states)
  });

  Object.defineProperty(storeMethods, 'rawStateHistory', {
    get: () => states
  });

  return storeMethods;
})();

module.exports = { createStore, describe };
