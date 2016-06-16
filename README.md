# Cubbie

Simple state storage

## Installation

```
npm i -S cubbie
```

## Usage

### Creating a Store

``` javascript
const cubbie = require('cubbie');

const store = cubbie.createStore();
```

### Initial State

Before you can start tracking state, you need to set an initial state:

``` javascript
store.initialState = {currentPage: 'home', loggedIn: true, etc: '...'};
// or
store.setInitialState({currentPage: 'home', loggedIn: true, etc: '...'});
```

`initialState` triggers the `STATE_SET` event. See the **Events** section.

To get the initial state:

``` javascript
store.initialState;
```

### Current State

``` javascript
store.state;
```

This is the same as getting the last element in the array returned from `store.stateHistory`.

### State History

Returns array of all of the states in history since the initial state.

``` javascript
store.stateHistory;
```

**Note:** Reverting or resetting the state will remove states from the state history. Modifying the state will append a new state to the state history.

### Modifying State

Pass a callback where you modify the state object.

``` javascript
store.modifyState(state => {
    state.x = y;
    state.z = 11;
    // etc.
});
```

This is an immutable operation and the newly modified state object will be added as the new state to the state history.

Example

``` javascript
store.stateHistory.length; // lets say its 1

store.modifyState(state => {
    state.x = y;
    state.z = 11;
    // etc.
});

store.stateHistory.length; // then now its 2
```

`modifyState` triggers the `STATE_MODIFIED` event. See the **Events** section.

`modifyState` will return the new current state.

### Get Previous State

``` javascript
store.previousState;
```

### Resetting State

This will reset the state to the initial state.

``` javascript
store.resetState();
```

`modifyState` triggers the `STATE_RESET` event. See the **Events** section.

### Reverting State

This will revert the state to a previous state.

**With No Arguments**

If nothing is passed as an argument, then the current state will be reverted to the most recent previous state:

``` javascript
store.revertState();
```

A successful revert will return `true`.

You can call `revertState` until you get to the initial state, then it will do nothing and return `false`.

**Reverting *n* Time**

Passing an integer to `revertState` will revert the state *n* times:

``` javascript
store.revertState(3); // reverts the state 3 times
```

Passing an integer to `revertState` will still only trigger the STATE_REVERTED event once, after it has finished reverting *n* times.

Thus, `store.revertState(1)` and `store.revertState()` are virtually equivalent.

**Conditional Revert**

This is definitely the more powerful way to revert the state. You can revert to the most recent state that meets a certain criteria.

Passing a function will iterate over each state, starting with the current state and ending with the initial state, and will revert to the state where the function returns `true`:

``` javascript
store.revertState(state => {
  return state.page === 'HOME' && state.loggedIn === true;
});

// Reverts the state to the last time where
// page was 'HOME' and where loggedIn was true
```

`revertState` triggers the `STATE_REVERTED` event. See the **Events** section.

### Purging the State History

If you want to clear the state history, for example to save memory, you can run this method.

It will remove all states from the state history except for the initial state and the current state.

``` javascript
store.purgeStateHistory();
```

### Static State

Internally, static state is a totally separate object from the normal state. It is meant to be set from the beginning of the app and it cannot be changed, unless you totally reset it.

The purpose is to store information that shouldn't need to be changed, such as URLs, file paths, config information, etc.

**Setting Static State**

``` javascript
store.staticState = {x: 11, y: 'yee'};
```

**Accessing Static State**

``` javascript
store.staticState;
```

### Events

**Adding Event Listeners**

``` javascript
store.on('EVENT_NAME', () => {
    // callback
});
```

A single listener can be attached to multiple events by passing the events names as an array. So, for example, to add a listener for all of the "State Events" (Built-in Events) you can do the following:

``` javascript
store.on(
  [
    "STATE_SET",
    "STATE_RESET",
    "STATE_REVERTED",
    "STATE_MODIFIED",
    "STATE_PROBED",
    "STATE_COMMITTED",
    "STATE_RELOADED"
  ],
  () => {
    // code here...
  }
)
```

But because you can get an array of all state events using `store.stateEvents` you could shorten the above code to:

``` javascript
store.on(store.stateEvents, () => {
  // code here...
})
```

NOTE: You can also use `once` method to only run the handler one time.

**Emitting Events**

``` javascript
store.emit('EVENT_NAME' [, optional_args]);
```

Arguments passed to the emitter will be passed as parameters to the event handler.

**Built-in Events**

Custom events can be added and emitted, but there are 5 built-in *State Events*.

- `STATE_SET` - Triggered on `store.initialState = {};` or `store.setInitialState({})`
- `STATE_RESET` - Triggered on `store.resetState();`
- `STATE_MODIFIED` - Triggered on `store.modifiyState(() => {});`
- `STATE_REVERTED` - Triggered on `store.revertState();`
- `STATE_PROBED` - Triggered on `store.probeState();`
- `STATE_COMMITED` - *Node Only* Triggered on after committing state to a file using `store.probeState();`
- `STATE_RELOADED` - *Node Only* Triggered on after loading state from a file using `store.reloadState();`

The only purpose of `probeState()` is to trigger the `STATE_PROBED` event.

To get an array of all state events, access the `stateEvents` property.


### Views

Similar in purpose to SQL views, views allow you to store a function that you can call on at any moment.

Example (using lodash's `maxBy`)

``` javascript
console.log(store.state); // { people: [{age: 13}, {age: 25}, {age: 20}] }


store.createView('oldestPerson', state => {
  return _.maxBy(state.people, person => person.age);
});

store.view('oldestPerson'); // {age: 25}
```

### Freezing the Store

See [Freezing the State Structure](FREEZE_STATE.md)

### Enforcing Types and/or Values

See [State Description: Enforcing Types and/or Values](STATE_DESCRIPTION.md)

### Saving State to Disk

See [Additional Features for Node](NODE_FEATURES.md)
