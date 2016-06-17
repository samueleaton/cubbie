# Reverting the State

This will revert the state to a previous state in the state history.

### Revert to Last State

If nothing is passed as an argument, then the current state will be reverted to the most recent previous state:

``` javascript
store.revertState();
```

A successful revert will return `true`.

You can call `revertState` until you get to the initial state, then it will do nothing and return `false`.

### Reverting *n* Times

Passing an integer to `revertState` will revert the state *n* times:

``` javascript
store.revertState(3); // reverts the state 3 times
```

Passing an integer to `revertState` will still only trigger the STATE_REVERTED event once, after it has finished reverting *n* times.

Thus, `store.revertState(1)` and `store.revertState()` are virtually equivalent.

### Conditional Revert

This is definitely the more powerful way to revert the state. You can revert to the most recent state that meets a certain criteria.

Passing a function will iterate over each state, starting with the current state and ending with the initial state, and will revert to the state where the function returns `true`:

``` javascript
store.revertState(state => {
  return state.page === 'HOME' && state.loggedIn === true;
});

// Reverts the state to the last time where
// page was 'HOME' and where loggedIn was true
```

`revertState` triggers the `STATE_REVERTED` event. See [The Event System](event_system.md).
