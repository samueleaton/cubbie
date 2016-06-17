# The Event System

### Adding Event Listeners

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

### Emitting Events

``` javascript
store.emit('EVENT_NAME' [, optional_args]);
```

Arguments passed to the emitter will be passed as parameters to the event handler.

### Built-in Events (`stateEvents`)

Custom events can be added and emitted, but there are 5 built-in *State Events*.

- `STATE_SET` - Triggered on `store.initialState = {};` or `store.setInitialState({})`
- `STATE_RESET` - Triggered on `store.resetState();`
- `STATE_MODIFIED` - Triggered on `store.modifiyState(() => {});`
- `STATE_REVERTED` - Triggered on `store.revertState();`
- `STATE_PROBED` - Triggered on `store.probeState();`
- `STATE_COMMITED` - Triggered after committing state to a file using `store.commitState();` (*Node.js Only*)
- `STATE_RELOADED` - Triggered after loading state from a file using `store.reloadState();` (*Node.js Only*)

The only purpose of `probeState()` is to trigger the `STATE_PROBED` event.

To get an array of all state events, access the `stateEvents` property.
