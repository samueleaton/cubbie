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
    "STORE_COMMITTED",
    "STORE_FETCHED"
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
- `STORE_COMMITTED` - Triggered after committing the store to a file using `store.commitStore();` (*Node.js Only*)
- `STORE_FETCHED` - Triggered after fetching the store from a file using `store.fetchStore();` (*Node.js Only*)

The only purpose of `probeState()` is to trigger the `STATE_PROBED` event.

To get an array of all state events, access the `stateEvents` property.

### Event Namespacing

Having so many events can get messy, so use namspaces to make things organized. Create a namespace object and then pass it to the `createEventNamspace` method.

``` javascript
const UserPreferenceEvents = {
  click() {
    console.log('* clicked UserPreferences');
  },
  hover() {
    console.log('* hovered UserPreferences');
  }
};

store.setEventNamespace('UserPreferences', UserPreferenceEvents);

store.emit('UserPreferences.click');
// * dblClicked UserPreferences.EditPersonalInfoBtn
```

But wait, there's more. Cubbie allows **multiple levels of namespacing** for even better organization and granularity.

``` javascript
const UserPreferenceEvents = {
  EditPersonalInfoBtn: {
    click() {
      console.log('* clicked UserPreferences.EditPersonalInfoBtn');
    },
    dblClick() {
      console.log('* dblClicked UserPreferences.EditPersonalInfoBtn');
    }
  },
  SecuritySection: {
    EditBtn: {
      click(str) {
        console.log('* clicked UserPreferences.SecuritySection.EditBtn: ', str);
      }
    }
  }
};

store.setEventNamespace('UserPreferences', UserPreferenceEvents);

store.emit('UserPreferences.EditPersonalInfoBtn.dblClick');
// * dblClicked UserPreferences.EditPersonalInfoBtn

store.emit('UserPreferences.SecuritySection.EditBtn.click', 'Yay!');
// * clicked UserPreferences.SecuritySection.EditBtn: Yay!
```

### Event Logging

To enable colorful event logging in the console, run `eventLogging(true)` method on the store. To disable, `eventLogging(false)`.

This will log every time an event is emitted.

<img title="cubbie event logging" alt="cubbie event logging" src="https://raw.githubusercontent.com/samueleaton/design/master/cubbie_event_logging.jpg"> 