# Using Cubbie with React

<img width="180" src="https://raw.githubusercontent.com/samueleaton/design/master/cubbie_plus_react.png">    

> Its a fact, Cubbie loves React 

<br />

*All examples on this page use this file structure:*

```
├-- main.js
|
├-┬ store
| ├- index.js
| ├- initialState.js
| ├- views.js
| └- events.js
|
└-┬ components
  ├- App.js
  ├- PersonDisplay.js
  └- NextPersonBtn.js
```

<br />

### Defining Our Initial State

This will be the state when our app first renders.

``` javascript
// store/initialState.js

const initialState = {
    people: [
        {name: 'Batman', city: 'Gotham'},
        {name: 'Finn', city: 'Ooo'},
        {name: 'Spongebob', city: 'Bikini Bottom'}
    ],
    currentPerson: 0
};

export default initialState;
```

### Creating the Store

We need to create a store for the state of our app.

``` javascript
// store/index.js

import cubbie from 'cubbie';
const store = cubbie.createStore();
export default store;
```

### Rendering the App

The cubbie store will emit an event whenever anything of interest happens to the state. The key is to make sure react know about it.  

We will will tell our store that on any state event to re-render our base React component. Because React will will do a diff using a virtual DOM, it doesn't matter if we re-render from the root component—its still fast.

<sub>*Render the app on any state changes:*</sub>

``` javascript
// main.js

import React from 'react';
import { render } from 'react-dom';
import store from './store';
import './store/views';
import './store/events';
import App from './components/App';

store.on(store.stateEvents, () => {
  render(<App />, document.getElementById('root'));
});


// ...

```


<sup>*To see a list of `stateEvents`, see [The Event System](event_system.md)*</sup>

In the code above, because cubbie's `on` method can take an array of events (e.g. `stateEvents`), it makes it easy to tell react to re-render on based on a handful of events.

We have set up the listener, but it won't actually render a the app until a state event is fired. The most appropriate event to initially render the app is the `STATE_SET` event, which is fired when we set our store's initial state—its the perfect crime.

<sub>*Setting the initial state will render the app:*</sub>

``` javascript
// main.js

import React from 'react';
import { render } from 'react-dom';
import store from './store';
import './store/views';
import './store/events';
import App from './components/App';

// a plain object holding state information
import initialState from './store/initialState'; 

store.on(store.stateEvents, () => {
  render(<App />, document.getElementById('root'));
});

store.setInitialState(initialState);
```

In the above snippet, the store is listening for any state events before it can render the app. The `setInitialState` method will fire `STATE_SET` (a state event) which will render the app.

### The `App` Component

The app component simply pulls in the other components. It doesn't give a fig about the state (in this example).

``` javascript
// components/App.js

import React from 'react';

import PersonDisplay from './PersonDisplay';
import NextPersonBtn from './NextPersonBtn';

export default function App() {
  return (
    <div className="app">
      <PersonDisplay />
      <NextPersonBtn />
    </div>
  );
};
```

### Store Views and the `PersonDisplay` Component

The `view` allows us to abstract some logic so that we don't need to do it in the component.

``` javascript
// store/views.js

import store from './index';

store.createView('currentPerson', state => {
  const currentPersonIndex = state.currentPerson;
  const currentPersonObj = state.people[currentPersonindex];
  
  // if there is no current person, return empty person 
  return currentPersonObj || { name: '', city: '' };
});
```

This component simply uses the current state to display the current person. 

``` javascript
// components/PersonDisplay.js

import React from 'react';

import store from '../store';

export default function CurrentPerson() {
  const currentPerson = store.view('currentPerson');

  return (
    <div className="current-person">
      <p>Name: {currentPerson.name}</p>
      <p>City: {currentPerson.city}</p>
    </div>
  );
};
```

### Store Events and the `NextPersonBtn` Component

In the `events.js` file we set up a listener to listen for the `nextPerson` event.

``` javascript
// store/events.js

import store from './index';

store.on('nextPerson', evt => {
  const currentPersonIndex = state.currentPerson;

  store.modifyState(state => {
    if (state.people[currentPersonindex])
      state.currentPerson++;
    else
      state.currentPerson = 0;
  });
});
```

This component will tell the store every time it is pressed by emitting an event to the store. The button will leave it up to any listeners to perform any logic.

``` javascript
// components/NextPersonBtn.js

import React from 'react';

import store from '../store';

export default function NextPersonBtn() {
  return (
    <buttononClick={evt => store.emit('nextPerson', evt)}>Next Person</button>
  );
};
```

As your app gets larger you will want to implement event namespacing to organize your events. See *[Event Namespacing](event_system.md#event-namespacing)*

