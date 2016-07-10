/* eslint-disable */
describe('cubbie', () => {
  let cubbie = require('../dist/cubbie.min.js');
  let store;

  beforeEach(() => {
    store = cubbie.createStore();
  });

  it('should have an empty store when created', () => {
    expect(store.rawStateHistory.length).toEqual(0);
  });

  it('should keep stores seperate', () => {
    expect(store).toBe(store);
    expect(store).not.toBe(cubbie.createStore());
    expect(cubbie.createStore()).not.toBe(cubbie.createStore());

    store.setInitialState({ pokemon: 'Blastoise' });
    const store2 = cubbie.createStore();
    expect(store.state.pokemon).toEqual('Blastoise');
    expect(store2.state).toBe(null);

    store2.setInitialState({ pokemon: 'Alakazam' });
    expect(store.stateHistory.length === store2.stateHistory.length).toBe(true);
    expect(store.state.pokemon).toEqual('Blastoise');
    expect(store2.state.pokemon).toEqual('Alakazam');
  });
});
