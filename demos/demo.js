import cubbie from '../dist/cubbie.bundle.js';
import _ from 'lodash';

const store = cubbie.createStore();

store.eventLogging.enable('Demo');

window.store = store;

store.on(store.stateEvents, () => {
  // console.log('* stateEvent fired');
});

store.describeState({
  people: cubbie.describe({ types: ['Array', 'Null'] }),
  currentPanel: cubbie.describe({ type: 'String', values: ['HOME', 'IRON'] }),
  animal: {
    info: cubbie.describe({ type: 'Array' })
  },
  currentPerson: cubbie.describe({ type: 'NUMBER' })
});

store.initialState = {
  people: [
    { name: 'Sam', age: 25 },
    { name: 'Jasmine', age: 22 },
    { name: 'Nick', age: 21 }
  ],
  animal: {
    info: [ null ]
  },
  currentPerson: 0,
  currentPanel: 'HOME'
};

// store.on('HELLO', (name, age) => {
//   console.log('1: hello ' + name + '. You are ' + age);
// });
// store.on('HELLO', (name, age) => {
//   console.log('2: hello ' + name + '. You are ' + age);
// });
// store.once('HELLO', (name, age) => {
//   console.log('3: HELLO ' + name + '!!! YOU ARE ' + age + '!!!');
// });
// store.once('HELLO', (name, age) => {
//   console.log('4: HELLO ' + name + '!!! YOU ARE ' + age + '!!!');
// });
// store.on('HELLO', (name, age) => {
//   console.log('5: hello ' + name + '. You are ' + age);
// });

// store.on('User.SelectBtn.click', () => {
//   store.emit('User.select');
// });

// store.on('User.select', () => {
//   store.modifyState(state => {
//     state.currentPerson = 1;
//   });
// });

// store.freeze();

// store.createView('oldestPerson', state => {
//   return _.maxBy(state.people, person => person.age);
// });

// store.createView('currentPerson', state => {
//   return state.people[state.currentPerson];
// });

// store.emit('User.SelectBtn.click');
