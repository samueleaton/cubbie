import cubbie from './index.js';

window.cubbie = cubbie;

cubbie.on('STATE_SET', () => {
  console.log('State Set.');
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


