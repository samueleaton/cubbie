/* eslint-disable */
describe('global namespaces', () => {
  let cubbie = require('../dist/cubbie.min.js');
  let store;

  beforeEach(() => {
    store = cubbie.createStore();
  });

  /*
  */
  it('should not do anything if never created', () => {
    let eventHeard = false;
    store.emit('global.go');
    expect(eventHeard).toEqual(false);
  });

  /*
  */
  it('should not be triggered if a listener is never emitted', () => {
    let eventHeard = false;
    store.setEventNamespace('global', {
      go: () => { eventHeard = true; }
    });
    expect(eventHeard).toEqual(false);
  });

  /*
  */
  it('should be triggered if a listener is emitted', () => {
    let eventHeard = false;
    store.setEventNamespace('global', {
      go: () => { eventHeard = true; }
    });
    store.emit('global.go');
    expect(eventHeard).toEqual(true);
  });

  /*
  */
  it('should be triggered if a listener is emitted without using `global`', () => {
    let eventCount = 0;
    store.setEventNamespace('global', {
      go: () => { eventCount++; },
      goAgain: () => { eventCount++; }
    });
    store.emit('go');
    store.emit('goAgain');
    expect(eventCount).toEqual(2);
  });
});
