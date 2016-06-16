'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* EVENT EMITTER
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CubbieEventEmitter = function () {
  function CubbieEventEmitter() {
    var _this = this;

    _classCallCheck(this, CubbieEventEmitter);

    this.events = {
      'STATE_SET': [],
      'STATE_RESET': [],
      'STATE_REVERTED': [],
      'STATE_MODIFIED': [],
      'STATE_PROBED': [],
      'STATE_COMMITTED': [],
      'STATE_RELOADED': []
    };
    this.stateEvents = ['STATE_SET', 'STATE_RESET', 'STATE_REVERTED', 'STATE_MODIFIED', 'STATE_PROBED', 'STATE_COMMITTED', 'STATE_RELOADED'];
    _lodash2.default.each(this.stateEvents, function (evt) {
      _this.events[evt] = [];
    });
  }

  _createClass(CubbieEventEmitter, [{
    key: 'on',
    value: function on(arg, cb) {
      var _this2 = this;

      var args = _lodash2.default.isArray(arg) ? arg : [arg];
      if (typeof cb !== 'function') return console.error('Cubbie Error: Last param to "on" must be of type "function".');
      _lodash2.default.each(args, function (evt) {
        if (!_lodash2.default.isArray(_this2.events[evt])) _this2.events[evt] = [];
        _this2.events[evt].push(cb);
      });
    }
  }, {
    key: 'once',
    value: function once(arg, cb) {
      var _this3 = this;

      var args = _lodash2.default.isArray(arg) ? arg : [arg];
      if (typeof cb !== 'function') return console.error('Cubbie Error: Last param to "on" must be of type "function".');
      _lodash2.default.each(args, function (evt) {
        if (!_lodash2.default.isArray(_this3.events[evt])) _this3.events[evt] = [];

        var callback = function callback() {
          cb.apply(undefined, arguments);
          var index = _this3.events[evt].indexOf(callback);
          _this3.events[evt][index] = null; // after running, make callback null
        };

        _this3.events[evt].push(callback);
      });
    }
  }, {
    key: 'emit',
    value: function emit(evt) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      if (!this.events[evt]) return;else {
        _lodash2.default.each(this.events[evt], function (cb) {
          if (cb) return cb.apply(undefined, args);
        });
      }
    }
  }]);

  return CubbieEventEmitter;
}();

exports.default = CubbieEventEmitter;