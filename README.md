# Cubbie

Stupid simple state storage

<br>  
<p align="center">
<img width="350" src="https://raw.githubusercontent.com/samueleaton/design/master/cubbie.png">    
</p>
<br>  

> State shouldn't be a chore, keep your state in Cubbie's store

<br>  

## The Lowdown

Cubbie allows the creation of state stores. It will keep track of the state history as the state is modified. It is built on an event system that allow anybody to listen for any state event.

If you are using Node.js (e.g. Electron) the state can be synced to and from a file for persistent storage.

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

You are essentially modifying a new state object that will become the new state—you are not modifying the "current state".

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

`modifyState` triggers the `STATE_MODIFIED` event. See [The Event System](docs/event_system.md).

`modifyState` will return the new current state.

### Get Previous State

This returns the state immediately before the current state.

``` javascript
store.previousState;
```

### Resetting State

This will reset the state to the initial state.

``` javascript
store.resetState();
```

`resetState` triggers the `STATE_RESET` event. See the **Events** section.

### Reverting the State

See [Reverting the State](docs/reverting_state.md)

### Views

Similar in purpose to SQL views, views allow you to store a function that you can call on at any moment. Its just some good ol' logic abstraction.

Example (using lodash's `maxBy`)

``` javascript
console.log(store.state); /* 
{ people: [
    {name: 'cat', age: 13}, {name: 'sam', age: 25}, {name: 'jas', age: 20}
  ]
}
*/


store.createView('oldestPerson', state => {
  return _.maxBy(state.people, person => person.age);
});

store.view('oldestPerson'); // {name: 'sam', age: 25}
```

### Purging the State History

If you want to clear the state history, for example to save memory, you can run this method.

It will remove all states from the state history except for the initial state and the current state. The current state will remain intact and no state events will be triggered.

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

### The Event System

See [The Event System](docs/event_system.md)

### Freezing the Store

See [Freezing the State Structure](docs/freeze_state.md)

### Enforcing Types and/or Values

See [State Description: Enforcing Types and/or Values](docs/state_description.md)

### Saving State to Disk

If, for example, you are building an app in Electron and want to save the state to disk, you totes can.

<img width="180" title="cubbie plus node" alt="cubbie plus node" src="https://raw.githubusercontent.com/samueleaton/design/master/cubbie_plus_node.png"> 

See **[Additional Features for Node](docs/node_features.md)**


### Usage with React

<img width="180" title="cubbie plus node" alt="cubbie plus node" src="https://raw.githubusercontent.com/samueleaton/design/master/cubbie_plus_react.png"> 

See **[Using Cubbie With React](docs/cubbie_with_react.md)**
