# The Event System

### Adding Event Listeners

``` javascript
store.on('EVENT_NAME', () => {
    // callback
});
```

A single listener can be attached to multiple events by passing the events names as an array. So, for example, to add a listener for all of the "Cubbie Events" (Built-in Events) you can do the following:

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

But because you can get an array of all cubbie events using `store.cubbieEvents` you could shorten the above code to:

``` javascript
store.on(store.cubbieEvents, () => {
  // code here...
})
```

NOTE: You can also use `once` method to only run the handler one time.

### Emitting Events

``` javascript
store.emit('EVENT_NAME' [, optional_args]);
```

Arguments passed to the emitter will be passed as parameters to the event handler.

### Removing Events

``` javascript
store.off('EVENT_NAME' [, callback]);
```

This remove the event listener for the event. If the callback is omitted, all listeners for the event will be removed.

### Built-in Events (`cubbieEvents`)

Custom events can be added and emitted, but there are 5 built-in *Cubbie Events*.

- `STATE_SET` - Triggered on `store.initialState = {};` or `store.setInitialState({})`
- `STATE_RESET` - Triggered on `store.resetState();`
- `STATE_MODIFIED` - Triggered on `store.modifiyState(() => {});`
- `STATE_REVERTED` - Triggered on `store.revertState();`
- `STATE_PROBED` - Triggered on `store.probeState();`
- `STORE_COMMITTED` - Triggered after committing the store to a file using `store.commitStore();` (*Node.js Only*)
- `STORE_FETCHED` - Triggered after fetching the store from a file using `store.fetchStore();` (*Node.js Only*)

The only purpose of `probeState()` is to trigger the `STATE_PROBED` event.

To get an array of all cubbie events, access the `cubbieEvents` property.

### Event Namespacing

Having so many events can get messy, so use namspaces to make things organized. Create a namespace object and then pass it to the `setEventNamspace` method.

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

#### Global Event Namespace

There is one certain namespace that is a little unique—the `global` namespace. The global namespace is created the same way as other namespaces (using the `setEventNamespace()` method). The main difference is that with the global namespace, the `global` prefix is optional when emitting an event.

``` javascript
store.setEventNamespace('global', {
  sayHello() {
    console.log('Hello!');
  }
});
store.emit('global.sayHello');
//=> Hello!
store.emit('sayHello');
//=> Hello!
```

We were able to emit the event with or without the `global.` prefix. The purpose of the global namespace is to *standardize* a location for you to store all top-level events so that they aren't scattered throughout your application.

### Event Logging

To enable colorful event logging in the console, run `eventLogging.enable()` method on the store. To disable, `eventLogging.disable()`.

This will log every time an event is emitted.

<img title="cubbie event logging" alt="cubbie event logging" src="https://raw.githubusercontent.com/samueleaton/design/master/cubbie_event_log.jpg"> 

If there *ARE* any event listeners associated with the event, the log will be a sea-green <img align="bottom" title="cubbie event log sea greeen" alt="cubbie event log sea greeen" src="https://raw.githubusercontent.com/samueleaton/design/master/sea-green.jpg"> color, otherwise it will an orange <img align="bottom" title="cubbie event log orange" alt="cubbie event log orange" src="https://raw.githubusercontent.com/samueleaton/design/master/orange.jpg"> color.
However, any of the built in cubbie events will be purple <img align="bottom" title="cubbie event log purple" alt="cubbie event log purple" src="https://raw.githubusercontent.com/samueleaton/design/master/purple.jpg">.

You can pass an optional string to the `enable` method to change the output from `Cubbie Event` to `YourString Event`. This helps distinguish multiple stores.
