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

### Freezing State Structure

The `freeze` method will prevent:

- Adding properties to the state
- Removing properties from the state
- Converting object or array to another type

Example

``` javascript
store.setInitialState({
  people: [{name: 'sam', age: 25}],
  currentPerson: {name: 'sam', age: 25}
});

store.freeze();

store.modifyState(state => {
  state.company = "Qualtrics";
}); // aborts, cannot add property to frozen state

store.modifyState(state => {
  state.people = null;
}); // aborts, cannot convert array to a non-array or non-object

store.modifyState(state => {
  state.currentPerson.favoriteColor = null;
}); // aborts, cannot add property to frozen state
```

Example 

```
store.setInitialState({
  people: [{name: 'sam', age: 25}],
  currentPerson: {name: 'sam', age: 25}
}).freeze();

/*
  THESE STILL WORK SUCCESSFULLY
*/

store.modifyState(state => {
  state.people.push({name: 'mike', age: 32})
});

store.modifyState(state => {
  state.people.currentPerson = {name: 'Jack', age: 24};
});
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
    "STATE_PROBED"
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

The only purpose of `probeState()` is to trigger the `STATE_PROBED` event.

To get an array of all state events, access the `stateEvents` property.


### Enforcing Types and/or Values

If you want to enforce types and/or values, you can do so by describing the state.

The state description is made for convenience during development, so any described states will not be enforced or checked if `NODE_ENV=production`.

There are 2 important methods: `describeState` and `describe`.

Use the `describeState` method (or the `stateDescription` setter) to initialize the state description. Use `describe` to describe a specific field. 

``` javascript
store.describeState({});
// or 
store.stateDescription = {};
```

Example

``` javascript
const desc = require('cubbie').describe;

store.describeState({
  name: desc({ type: 'String' }),
  age: desc({ types: ['Number', 'Null'] }),
  pet: {
    name: desc({ type: 'String' }),
    kind: desc({ values: ['cat', 'dog'] })
  }
});

store.setInitialState({
  name: 'Sam',
  age: 25,
  pet: {
    name: 'Izzy',
    kind: 'cat',
    breed: 'tabby' // not described, so can be ANY value
  }
});

store.freeze(); // optional

```

You don't have to describe every single piece of the state.

##### About the `describe` Method

**There are four properties for `describe`:**
- **`type`** - A single string
- **`types`** - An array of types
- **`values`** - An array of values
- **`of`** - Can specify the types of elements in an array if `type` is `Array`

``` javascript
// describes state as an array of numbers
store.describeState({
  myNumbers: desc({ type: 'Array', of: 'Number' })
});
```

`type` and `types` cannot be used in the same description object for the same property.

**The following are valid types to use as a `type` or in `types`:**
- `'Array'`
- `'Boolean'`
- `'Date'`
- `'Element'`
- `'Function'`
- `'Null'`
- `'Number'`
- `'Object'`
- `'RegExp'`
- `'String'`
- `'Symbol'`
- `'Undefined'`
