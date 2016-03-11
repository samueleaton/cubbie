'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* EVENT EMITTER
*/

var events = {
  'STATE_SET': [],
  'STATE_RESET': [],
  'STATE_REVERTED': [],
  'STATE_MODIFIED': [],
  'STATE_PROBED': []
};

var _stateEvents = ['STATE_SET', 'STATE_RESET', 'STATE_REVERTED', 'STATE_MODIFIED', 'STATE_PROBED'];

_.each(_stateEvents, function (evt) {
  events[evt] = [];
});

function on(arg, cb) {
  var args = _.isArray(arg) ? arg : [arg];
  if (typeof cb !== 'function') return console.error('Cubbie Error: Last param to "on" must be of type "function".');
  _.each(args, function (evt) {
    if (!_.isArray(events[evt])) events[evt] = [];
    events[evt].push(cb);
  });
}

function emit(evt) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (!events[evt]) return;else _.each(events[evt], function (cb) {
    return cb.apply(undefined, args);
  });
}

var eventEmitter = {
  on: on,
  emit: emit,
  stateEvents: function stateEvents() {
    return _stateEvents.map(function (x) {
      return x;
    });
  }
};

exports.default = eventEmitter;