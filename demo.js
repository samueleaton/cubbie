import cubbie from './index.js';

window.cubbie = cubbie;

cubbie.on('STATE_SET', () => {
  console.log('State Set.');
});

cubbie.describeState({
  people: cubbie.describe({ types: ['Array', 'Null'] }),
  currentPanel: cubbie.describe({ type: 'String', values: ['HOME', 'IRON'] }),
  animal: {
    info: cubbie.describe({ type: 'Array' })
  },
  currentPerson: {
    name: cubbie.describe({ values: ['Sam'] })
  }
});

cubbie.initialState = {
  people: [
    {name: "Sam", age: 25},
    {name: "Jasmine", age: 22},
    {name: "Nick", age: 21}
  ],
  animal: {
    info: [null]
  },
  currentPerson: {name: "Sam", age: 25},
  currentPanel: 'HOME'
};

cubbie.on('HELLO', (name, age) => {
  console.log('1: hello ' + name + '. You are ' + age);
});
cubbie.on('HELLO', (name, age) => {
  console.log('2: hello ' + name + '. You are ' + age);
});
cubbie.once('HELLO', (name, age) => {
  console.log('3: HELLO ' + name + '!!! YOU ARE ' + age + '!!!');
});
cubbie.once('HELLO', (name, age) => {
  console.log('4: HELLO ' + name + '!!! YOU ARE ' + age + '!!!');
});
cubbie.on('HELLO', (name, age) => {
  console.log('5: hello ' + name + '. You are ' + age);
});

cubbie.freeze();
