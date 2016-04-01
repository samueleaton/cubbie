'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var events = {
  'STATE_SET': [],
  'STATE_RESET': [],
  'STATE_REVERTED': [],
  'STATE_MODIFIED': [],
  'STATE_PROBED': []
}; /* EVENT EMITTER
   */


var _stateEvents = ['STATE_SET', 'STATE_RESET', 'STATE_REVERTED', 'STATE_MODIFIED', 'STATE_PROBED'];

_lodash2.default.each(_stateEvents, function (evt) {
  events[evt] = [];
});

function on(arg, cb) {
  var args = _lodash2.default.isArray(arg) ? arg : [arg];
  if (typeof cb !== 'function') return console.error('Cubbie Error: Last param to "on" must be of type "function".');
  _lodash2.default.each(args, function (evt) {
    if (!_lodash2.default.isArray(events[evt])) events[evt] = [];
    events[evt].push(cb);
  });
}

function once(arg, cb) {
  var args = _lodash2.default.isArray(arg) ? arg : [arg];
  if (typeof cb !== 'function') return console.error('Cubbie Error: Last param to "on" must be of type "function".');
  _lodash2.default.each(args, function (evt) {
    if (!_lodash2.default.isArray(events[evt])) events[evt] = [];

    var callback = function callback() {
      cb.apply(undefined, arguments);
      var index = events[evt].indexOf(callback);
      events[evt][index] = null;
    };

    events[evt].push(callback);
  });
}

function emit(evt) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (!events[evt]) return;else {
    _lodash2.default.each(events[evt], function (cb) {
      if (cb) return cb.apply(undefined, args);
    });
  }
}

var eventEmitter = {
  on: on,
  once: once,
  emit: emit,
  stateEvents: function stateEvents() {
    return _stateEvents.map(function (x) {
      return x;
    });
  }
};

exports.default = eventEmitter;