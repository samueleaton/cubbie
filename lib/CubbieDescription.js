'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CubbieDescription = function () {
  _createClass(CubbieDescription, null, [{
    key: 'doesValueMatchType',
    value: function doesValueMatchType(value, type) {
      if (_lodash2.default.isArray(type)) {
        if (_lodash2.default.includes(type, 'Array')) {
          if (_lodash2.default.isArray(value)) return true;
        }
        if (_lodash2.default.includes(type, 'Boolean')) {
          if (_lodash2.default.isBoolean(value)) return true;
        }
        if (_lodash2.default.includes(type, 'Date')) {
          if (_lodash2.default.isDate(value)) return true;
        }
        if (_lodash2.default.includes(type, 'Element')) {
          if (_lodash2.default.isElement(value)) return true;
        }
        if (_lodash2.default.includes(type, 'Null')) {
          if (_lodash2.default.isNull(value)) return true;
        }
        if (_lodash2.default.includes(type, 'Number')) {
          if (_lodash2.default.isNumber(value)) return true;
        }
        if (_lodash2.default.includes(type, 'Object')) {
          if (_lodash2.default.isPlainObject(value)) return true;
        }
        if (_lodash2.default.includes(type, 'RegExp')) {
          if (_lodash2.default.isRegExp(value)) return true;
        }
        if (_lodash2.default.includes(type, 'String')) {
          if (_lodash2.default.isString(value)) return true;
        }
        if (_lodash2.default.includes(type, 'Symbol')) {
          if (_lodash2.default.isSymbol(value)) return true;
        }
        if (_lodash2.default.includes(type, 'Undefined')) {
          if (_lodash2.default.isUndefined(value)) return true;
        }
        if (_lodash2.default.includes(type, 'Function')) {
          if (_lodash2.default.isFunction(value)) return true;
        }
        return false;
      } else {
        if (type === 'Array') {
          if (!_lodash2.default.isArray(value)) return false;
        } else if (type === 'Boolean') {
          if (!_lodash2.default.isBoolean(value)) return false;
        } else if (type === 'Date') {
          if (!_lodash2.default.isDate(value)) return false;
        } else if (type === 'Element') {
          if (!_lodash2.default.isElement(value)) return false;
        } else if (type === 'Null') {
          if (!_lodash2.default.isNull(value)) return false;
        } else if (type === 'Number') {
          if (!_lodash2.default.isNumber(value)) return false;
        } else if (type === 'Object') {
          if (!_lodash2.default.isPlainObject(value)) return false;
        } else if (type === 'RegExp') {
          if (!_lodash2.default.isRegExp(value)) return false;
        } else if (type === 'String') {
          if (!_lodash2.default.isString(value)) return false;
        } else if (type === 'Symbol') {
          if (!_lodash2.default.isSymbol(value)) return false;
        } else if (type === 'Undefined') {
          if (!_lodash2.default.isUndefined(value)) return false;
        } else if (type === 'Function') {
          if (!_lodash2.default.isFunction(value)) return false;
        }
        return true;
      }
    }
  }, {
    key: 'isCubbieDescription',
    value: function isCubbieDescription(obj) {
      return obj instanceof CubbieDescription || obj.constructor === CubbieDescription;
    }
  }]);

  function CubbieDescription(obj) {
    _classCallCheck(this, CubbieDescription);

    if (!_lodash2.default.isPlainObject(obj)) {
      console.error('Must pass object to "describe"');
    }
    if (!obj.type && !obj.types && !obj.values) {
      console.error('Must specify type, types, or values with "describe"');
      return;
    }
    if (obj.type && obj.types) {
      console.error('Cannot specify both "type" and "types" with "describe"');
      return;
    }
    if (obj.type && _lodash2.default.isString(obj.type)) {
      this.type = obj.type;
    }
    if (obj.types && _lodash2.default.isArray(obj.types)) {
      this.types = obj.types;
    }
    if (!_lodash2.default.isUndefined(obj.values)) {
      if (_lodash2.default.isArray(obj.values)) {
        if (obj.values.length) this.values = obj.values;else console.error('"values" cannot be an empty array in "describe"');
      } else console.error('"values" must be an array in "describe"');
    }

    this.statePath = [];
  }

  return CubbieDescription;
}();

exports.default = CubbieDescription;