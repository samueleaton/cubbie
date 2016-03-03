import each from 'lodash.foreach';
import isArray from 'lodash.isArray';
import cloneDeep from 'lodash.clonedeep';
import findLastIndex from 'lodash.findlastindex';
import difference from 'lodash.difference';
import isObjectLike from 'lodash.isobjectlike';
import keys from 'lodash.keys';
import forOwn from 'lodash.forown';

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
    const args = isArray(arg) ? arg : [ arg ] ;
    if (typeof cb !== 'function')
      return console.error('Cubbie Error: Last param to "on" must be of type "function".');
    each(args, evt => {
      if (!isArray(events[evt]))
        events[evt] = [];
      events[evt].push(cb);
    });
    return store;
  }
  function emit(evt, ...args) {
    if (isStateEvent(evt)) {
      each(events[evt], cb => cb(store.currentState(), ...args));
    }
    else if (!events[evt])
      return store;
    else {
      each(events[evt], cb => cb(...args));
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
  const staticStateObj = {};
  const keyTree = {};
  let frozen = false;
  let initialStateSet = false;

  /**/
  function currentState() {
    return cloneDeep(states[states.length - 1]);
  }

  /**/
  function resetState() {
    states.splice(1);
    event.emit('STATE_RESET');
    return cubbie;
  }

  /**/
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

  /**/
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

  /**/
  function modifyState(func) {
    const tempState = currentState();
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
    if (states.length <= 2)
      return Object.assign({}, states[1]);
    else
      return Object.assign({}, states[states.length - 2]);
  }
  
  /**/
  function getInitialState(obj) {
    return cloneDeep(states[0]);
  }
  
  /**/
  function setInitialState(obj) {
    if (frozen) {
      console.error('Cubbie Error: Cubbie is frozen, cannot set initialState again.');
      return null;
    }

    if (typeof obj !== 'object') {
      console.error('Cubbie Error: Must assign object to initialState. Instead assigned ' + typeof obj);
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
    return states.map(x => cloneDeep(x));
  }
  
  /**/
  function setStaticState(obj) {
    if (typeof obj !== 'object') {
      console.error('Cubbie Error: Must assign object to staticState. Instead assigned ' + typeof obj);
      return null;
    }

    each(forOwn(obj), (v, k) => {
      staticStateObj[k] = v;
    });
    return cubbie;
  }
  
  /**/
  function staticState() {
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
    forOwn(state, (v, k) => {
      if (isObjectLike(v)) {
        tree[k] = {};
        setKeyTree(tree[k], state[k]);
      }
      else {
        tree[k] = true;
      }
    });
  }

  /**/
  function wasStateRestructured(tree, state) {
    if (isArray(state))
      return false;

    const treeKeys = keys(tree);
    const stateKeys = keys(state);
    const stateToTreeDifference = difference(stateKeys, treeKeys);
    const treeToStateDifference = difference(treeKeys, stateKeys);
    let errors = false;

    if (stateToTreeDifference.length) {
      console.warn('Cubbie Warning: Properties added to frozen state: ', stateToTreeDifference);
      errors = true;
      return errors;
    }

    forOwn(tree, (v, k) => {
      if (isObjectLike(v) && !isObjectLike(state[k])) {
        console.warn(
          `Cubbie Warning: Cannot convert frozen array or object to another type.`,
          `Attempted to convert frozen property "${k}" to ${!state[k] ? state[k] : typeof state[k]}`
        );
        console.warn();
        errors = true;
        return;
      }
      if (isObjectLike(v)) {
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
    currentState,
    resetState,
    revertState,
    modifyState,
    setInitialState,
    probe,
    freeze
  };
})(); 


/* CUBBIE
*/
const cubbie = {
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
  get: () => store.staticState(),
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
