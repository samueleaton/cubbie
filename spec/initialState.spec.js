/* eslint-disable */
describe('initialState', () => {
  let cubbie = require('../dist/cubbie.min.js');
  let store;

  beforeEach(() => {
    store = cubbie.createStore();
  });

  /*
  */
  it('should not extst when store is created', () => {
    expect(store.initialState).toEqual(null);
  });

  /*
  */
  it('should exist when set', () => {
    store.setInitialState({ person: { name: 'sam' } });
    
    expect(store.initialState).not.toBe(null);
    expect(store.initialState).not.toBe({ person: { name: 'gandalf' } });
    expect(store.initialState).toEqual({ person: { name: 'sam' } });
  });

  /*
  */
  it('should be the current state when set', () => {
    store.setInitialState({ person: { name: 'sam' } });
    
    expect(store.initialState).toEqual(store.state);
    expect(store.stateHistory.length).toEqual(1);
  });

  /*
  */
  it('should never change when state is modified or reverted', () => {
    store.setInitialState({ person: { name: 'sam', age: 25 } });
    
    expect(store.initialState).toEqual(store.state);
    expect(store.initialState).toEqual({ person: { name: 'sam', age: 25 } });
    
    store.modifyState(s => {
      s.person = {
        name: 'Gandalf',
        age: 500
      };
    });

    expect(store.initialState).not.toEqual(store.state);
    expect(store.initialState).toEqual({ person: { name: 'sam', age: 25 } });

    store.modifyState(s => {
      s.person = {
        name: 'Frodo',
        age: 300,
        home: 'Shire'
      };
    });

    expect(store.stateHistory.length).toEqual(3);
    expect(store.initialState).not.toEqual(store.state);
    expect(store.rawStateHistory[0].state).toEqual({ person: { name: 'sam', age: 25 } });

    store.revertState(2);
    expect(store.initialState).toEqual(store.state);
    expect(store.initialState).toEqual({ person: { name: 'sam', age: 25 } });
  });

  /*
  */
  it('should emit STATE_SET event when set', () => {
    let emitted = false;
    expect(emitted).toBe(false);
    store.on('STATE_SET', () => { emitted = true; })
    store.setInitialState({ person: { name: 'sam', age: 25 } });
    expect(emitted).toBe(true);
  });
});
