/* EVENT EMITTER
*/
import _ from 'lodash';

const events = {
  'STATE_SET': [],
  'STATE_RESET': [],
  'STATE_REVERTED': [],
  'STATE_MODIFIED': [],
  'STATE_PROBED': []
};

const stateEvents = [
  'STATE_SET',
  'STATE_RESET',
  'STATE_REVERTED',
  'STATE_MODIFIED',
  'STATE_PROBED'
];

_.each(stateEvents, evt => { events[evt] = [] });

function on(arg, cb) {
  const args = _.isArray(arg) ? arg : [ arg ] ;
  if (typeof cb !== 'function')
    return console.error('Cubbie Error: Last param to "on" must be of type "function".');
  _.each(args, evt => {
    if (!_.isArray(events[evt]))
      events[evt] = [];
    events[evt].push(cb);
  });
}

function once(arg, cb) {
  const args = _.isArray(arg) ? arg : [ arg ] ;
  if (typeof cb !== 'function')
    return console.error('Cubbie Error: Last param to "on" must be of type "function".');
  _.each(args, evt => {
    if (!_.isArray(events[evt]))
      events[evt] = [];
    
    const callback = (...args) => {
      cb(...args);
      const index = events[evt].indexOf(callback);
      events[evt][index] = null; // after running, make callback null
    };

    events[evt].push(callback);
  });
}

function emit(evt, ...args) {
  if (!events[evt])
    return;
  else {
    _.each(events[evt], cb => {
      if (cb) return cb(...args)
    });
  }
}

const eventEmitter = {
  on,
  once,
  emit,
  stateEvents: () => stateEvents.map(x => x)
};

export default eventEmitter;
