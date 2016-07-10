/* eslint-disable */
describe('current state', () => {
  let cubbie = require('../dist/cubbie.min.js');
  let store;

  beforeEach(() => {
    store = cubbie.createStore();
  });

  /*
  */
  it('should not extst when store is created', () => {
    expect(store.state).toEqual(null);
  });

  /*
  */
  it('should exist when set', () => {
    store.setInitialState({ person: { name: 'sam' } });
    
    expect(store.state).not.toBe(null);
    expect(store.state).not.toBe({ person: { name: 'gandalf' } });
    expect(store.state).toEqual({ person: { name: 'sam' } });
  });

  /*
  */
  it('should be the initial state when set', () => {
    store.setInitialState({ person: { name: 'sam' } });
    
    expect(store.initialState).toEqual(store.state);
    expect(store.stateHistory.length).toEqual(1);
  });

  /*
  */
  it('should change (if different) when state is modified or reverted', () => {
    store.setInitialState({ person: { name: 'sam', age: 25 } });
    
    expect(store.state).toEqual(store.rawStateHistory[0].state);
    expect(store.state).toEqual({ person: { name: 'sam', age: 25 } });
    
    store.modifyState(s => {
      s.person = {
        name: 'Gandalf',
        age: 500
      };
    });

    expect(store.stateHistory[1]).toEqual(store.state);
    expect(store.state).toEqual({ person: { name: 'Gandalf', age: 500 } });

    store.modifyState(s => {
      s.person = {
        name: 'Frodo',
        age: 300,
        home: 'Shire'
      };
    });

    expect(store.stateHistory.length).toEqual(3);
    expect(store.state).toEqual({ person: { name: 'Frodo', age: 300, home: 'Shire' } });
    expect(store.rawStateHistory[2].state).toEqual(store.state);

    store.revertState();
    expect(store.state).toEqual({ person: { name: 'Gandalf', age: 500 } });
  });

  /*
  */
  it('should emit STATE_MODIFIED event when modified', () => {
    store.setInitialState({ person: { name: 'sam', age: 25 } });
    let emitted = false;
    expect(emitted).toBe(false);
    store.on('STATE_MODIFIED', () => { emitted = true; })
    store.modifyState(s => {
      s.person = {
        name: 'Frodo',
        age: 300,
        home: 'Shire'
      };
    });
    expect(emitted).toBe(true);
  });
});
