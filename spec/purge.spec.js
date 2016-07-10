/* eslint-disable */
describe('initialState', () => {
  let cubbie = require('../dist/cubbie.min.js');
  let store;

  beforeEach(() => {
    store = cubbie.createStore();
  });

  /*
  */
  it('should do nothing if there is no initialState', () => {
    store.purge()
    expect(store.stateHistory.length).toEqual(0);
  });

  /*
  */
  it('should do nothing if there only one state', () => {
    store.setInitialState({ person: { name: 'sam', age: 25 } });
    store.purge();
    expect(store.stateHistory.length).toEqual(1);
    expect(store.state.person.name).toBe('sam');
  });

  /*
  */
  it('remove all states except the current state', () => {
    store.setInitialState({ person: { name: 'Sam', age: 25 } });

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
        
    store.modifyState(s => {
      s.person = {
        name: 'Gandalf',
        age: 500
      };
    });

    store.purge();
    expect(store.stateHistory.length).toEqual(1);
    expect(store.state).toEqual({
      person: {
        name: 'Gandalf',
        age: 500
      }
    });
  });

  /*
  */
  it('should set the current state to be the initalState', () => {
    store.setInitialState({ person: { name: 'Sam', age: 25 } });

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
        
    store.modifyState(s => {
      s.person = {
        name: 'Gandalf',
        age: 500
      };
    });

    store.purge();
    expect(store.stateHistory.length).toEqual(1);
    expect(store.state).toEqual({
      person: {
        name: 'Gandalf',
        age: 500
      }
    });
    expect(store.rawStateHistory[0].isInitialState).toBe(true);
  });
});
