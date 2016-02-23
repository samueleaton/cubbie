# Cubbie

Simple state storage

Cubbie has the same use case as Redux but is made for quicker prototyping or smaller apps. Cubbie has less boilerplate. 

## Usage

**Simply set the initial state**

``` javascript
import store from 'cubbie';

store.setInitialState({currentPage: 'home', loggedIn: true});
```

`setInitialState` triggers the `STATE_SET` event. See the **Events** section.

**Accessing current the state**

``` javascript
const state = store.state;
// or
const state = store.currentState();
```

**Getting the state history**

``` javascript
store.stateHistory();
// returns array of all of the states in history of session
```

**Modify the state**

Pass a callback where you modify the state object.

``` javascript
store.modifyState(state => {
    state.x = y;
    state.z = 11;
    // etc.
});
```

This is an immutable operation and the state object will be added as the new state.

``` javascript
store.stateHistory().length; // lets say its 1

const state = store.modifyState(state => {
    state.x = y;
    state.z = 11;
    // etc.
});

store.stateHistory().length; // then now its 2
```

`modifyState` triggers the `STATE_MODIFIED` event. See the **Events** section.

`modifyState` will return the new current state.

**Get Previous State**

``` javascript
store.previousState();
```

**Resetting State**

This will reset the state to the initial state.

``` javascript
store.resetState();
```

`modifyState` triggers the `STATE_RESET` event. See the **Events** section.

**Revert State**

This will revert the state to the previous state.

``` javascript
store.revertState();
```

You can call `revertState` until you get to the initial state, then it will do nothing and return `false`. 

`modifyState` triggers the `STATE_REVERTED` event. See the **Events** section.

### Static State

Internally, static state is a totally separate object from the normal state. It is meant to be set from the beginning of the app and it cannot be changed, unless you totally reset it.

The purpose is to store information that shouldn't need to be changed, such as URLs, file paths, config information, etc. 

**Setting Static State**

``` javascript
store.setStaticState({x: 11, y: 'yee'});
```

**Accessing Static State**

``` javascript
store.staticState();
```

### Events

Adding event listeners:

``` javascript
store.on('EVENT_NAME', () => {
    // callback
});
```

Emitting events:

``` javascript
store.emit('EVENT_NAME' [, optional_args]);
```

Arguments passed to the emitter will be passed as parameters to the event handler. 

**Built-in Events**

Custom events can be added and emitted, but there are 5 built-in events. 

- `STATE_SET` - Triggered on `store.setInitialState({});`
- `STATE_RESET` - Triggered on `store.resetState();`
- `STATE_MODIFIED` - Triggered on `store.modifiyState(() => {});`
- `STATE_REVERTED` - Triggered on `store.revertState();`
- `STATE_PROBED` - Triggered on `store.probeState();`

The whole purpose of `probeState()` is to trigger the `STATE_PROBED` event.

