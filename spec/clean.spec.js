/* eslint-disable */
describe('store.clean()', () => {
  let cubbie = require('../dist/cubbie.min.js');
  let store;

  beforeEach(() => {
    store = cubbie.createStore();
  });

  /*
  */
  it('should do nothing if store is empty', () => {
    store.clean();
    expect(store.state).toEqual(null);
  });

  /*
  */
  it('should do nothing if all states are different', () => {
    store.setInitialState({ person: { name: 'Sam', age: 25 } });
        
    store.modifyState(s => {
      s.person = {
        name: 'Gandalf',
        age: 500
      };
    });

    store.modifyState(s => {
      s.person = {
        name: 'Frodo',
        age: 300,
        home: 'Shire'
      };
    });

    store.modifyState(s => {
      s.person = {
        name: 'Aragorn',
        age: 100,
        home: null
      };
    });

    store.modifyState(s => {
      s.person = {
        name: 'Sauron',
        age: 1000,
        home: 'Mordor'
      };
    });

    store.modifyState(s => {
      s.person = {
        name: 'Gollum',
        age: 1000,
        home: null
      };
    });

    store.clean();
    expect(store.stateHistory.length).toEqual(6);
    expect(store.stateHistory[1]).toEqual({ person: { name: 'Gandalf', age: 500 } });
    expect(store.stateHistory[2]).toEqual({ person: { name: 'Frodo', age: 300, home: 'Shire' } });
    expect(store.stateHistory[3]).toEqual({ person: { name: 'Aragorn', age: 100, home: null } });
    expect(store.stateHistory[4]).toEqual({ person: { name: 'Sauron', age: 1000, home: 'Mordor' } });
    expect(store.stateHistory[5]).toEqual({ person: { name: 'Gollum', age: 1000, home: null } });
  });
});
