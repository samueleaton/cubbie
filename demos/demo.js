import cubbie from '../index.js';
import _ from 'lodash';

const store = cubbie.createStore();

window.store = store;

store.on('STATE_SET', () => {
  console.log('State Set.');
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
    {name: "Sam", age: 25},
    {name: "Jasmine", age: 22},
    {name: "Nick", age: 21}
  ],
  animal: {
    info: [null]
  },
  currentPerson: 0,
  currentPanel: 'HOME'
};

store.on('HELLO', (name, age) => {
  console.log('1: hello ' + name + '. You are ' + age);
});
store.on('HELLO', (name, age) => {
  console.log('2: hello ' + name + '. You are ' + age);
});
store.once('HELLO', (name, age) => {
  console.log('3: HELLO ' + name + '!!! YOU ARE ' + age + '!!!');
});
store.once('HELLO', (name, age) => {
  console.log('4: HELLO ' + name + '!!! YOU ARE ' + age + '!!!');
});
store.on('HELLO', (name, age) => {
  console.log('5: hello ' + name + '. You are ' + age);
});

store.freeze();

store.createView('oldestPerson', state => {
  return _.maxBy(state.people, person => person.age);
})

store.createView('currentPerson', state => {
  return state.people[state.currentPerson];
})