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
    value: function doesValueMatchType(value, _typeObj) {
      var typeObj = _lodash2.default.isObjectLike(_typeObj) ? _typeObj : { type: _typeObj };
      // console.log('\ntypeObj: ', typeObj);
      if (_lodash2.default.isArray(typeObj.type)) {
        if (_lodash2.default.includes(typeObj.type, 'ARRAY')) {
          if (_lodash2.default.isArray(value)) return true;
        }
        if (_lodash2.default.includes(typeObj.type, 'BOOLEAN')) {
          if (_lodash2.default.isBoolean(value)) return true;
        }
        if (_lodash2.default.includes(typeObj.type, 'DATE')) {
          if (_lodash2.default.isDate(value)) return true;
        }
        if (_lodash2.default.includes(typeObj.type, 'ELEMENT')) {
          if (_lodash2.default.isElement(value)) return true;
        }
        if (_lodash2.default.includes(typeObj.type, 'NULL')) {
          if (_lodash2.default.isNull(value)) return true;
        }
        if (_lodash2.default.includes(typeObj.type, 'NUMBER')) {
          if (_lodash2.default.isNumber(value)) return true;
        }
        if (_lodash2.default.includes(typeObj.type, 'OBJECT')) {
          if (_lodash2.default.isPlainObject(value)) return true;
        }
        if (_lodash2.default.includes(typeObj.type, 'REGEXP')) {
          if (_lodash2.default.isRegExp(value)) return true;
        }
        if (_lodash2.default.includes(typeObj.type, 'STRING')) {
          if (_lodash2.default.isString(value)) return true;
        }
        if (_lodash2.default.includes(typeObj.type, 'SYMBOL')) {
          if (_lodash2.default.isSymbol(value)) return true;
        }
        if (_lodash2.default.includes(typeObj.type, 'UNDEFINED')) {
          if (_lodash2.default.isUndefined(value)) return true;
        }
        if (_lodash2.default.includes(typeObj.type, 'FUNCTION')) {
          if (_lodash2.default.isFunction(value)) return true;
        }
        return false;
      } else {
        if (typeObj.type === 'ARRAY') {
          if (!_lodash2.default.isArray(value)) return false;
          // if (typeObj.of) {
          //   console.log('"of" (' + typeObj.of + ') found for typeObj.type (' + typeObj.type + ')');
          //   console.log('Array: ', value);
          //   _.forEach(value, v => {
          //     console.log('does value (' + v + ') match type (' + typeObj.of + '): ', CubbieDescription.doesValueMatchType(v, typeObj.of));
          //   })
          // }
          if (typeObj.of && _lodash2.default.some(value, function (v) {
            return !CubbieDescription.doesValueMatchType(v, typeObj.of);
          })) return false;
        } else if (typeObj.type === 'BOOLEAN') {
          if (!_lodash2.default.isBoolean(value)) return false;
        } else if (typeObj.type === 'DATE') {
          if (!_lodash2.default.isDate(value)) return false;
        } else if (typeObj.type === 'ELEMENT') {
          if (!_lodash2.default.isElement(value)) return false;
        } else if (typeObj.type === 'NULL') {
          if (!_lodash2.default.isNull(value)) return false;
        } else if (typeObj.type === 'NUMBER') {
          if (!_lodash2.default.isNumber(value)) return false;
        } else if (typeObj.type === 'OBJECT') {
          if (!_lodash2.default.isPlainObject(value)) return false;
        } else if (typeObj.type === 'REGEXP') {
          if (!_lodash2.default.isRegExp(value)) return false;
        } else if (typeObj.type === 'STRING') {
          if (!_lodash2.default.isString(value)) return false;
        } else if (typeObj.type === 'SYMBOL') {
          if (!_lodash2.default.isSymbol(value)) return false;
        } else if (typeObj.type === 'UNDEFINED') {
          if (!_lodash2.default.isUndefined(value)) return false;
        } else if (typeObj.type === 'FUNCTION') {
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
  }, {
    key: 'getType',
    value: function getType(value) {
      if (_lodash2.default.isArray(value)) return 'ARRAY';else if (_lodash2.default.isBoolean(value)) return 'BOOLEAN';else if (_lodash2.default.isDate(value)) return 'DATE';else if (_lodash2.default.isElement(value)) return 'ELEMENT';else if (_lodash2.default.isNull(value)) return 'NULL';else if (_lodash2.default.isNumber(value)) return 'NUMBER';else if (_lodash2.default.isPlainObject(value)) return 'OBJECT';else if (_lodash2.default.isRegExp(value)) return 'REGEXP';else if (_lodash2.default.isString(value)) return 'STRING';else if (_lodash2.default.isSymbol(value)) return 'SYMBOL';else if (_lodash2.default.isUndefined(value)) return 'UNDEFINED';else if (_lodash2.default.isFunction(value)) return 'FUNCTION';else return value.contructor.prototype;
    }
  }, {
    key: 'isValidType',
    value: function isValidType(type) {
      return _lodash2.default.includes(['ARRAY', 'BOOLEAN', 'DATE', 'ELEMENT', 'NULL', 'NUMBER', 'OBJECT', 'REGEXP', 'STRING', 'SYMBOL', 'UNDEFINED', 'FUNCTION'], type.toUpperCase());
    }
  }]);

  function CubbieDescription(obj) {
    _classCallCheck(this, CubbieDescription);

    if (!_lodash2.default.isPlainObject(obj)) return console.error('Must pass object to "describe"');
    if (!obj.type && !obj.types && !obj.values) return console.error('Must specify type, types, or values with "describe"');
    if (obj.type && obj.types) return console.error('Cannot specify both "type" and "types" with "describe"');
    if (obj.type && _lodash2.default.isString(obj.type)) {
      if (!CubbieDescription.isValidType(obj.type)) return console.error('Invalid type: ' + obj.type);
      this.type = obj.type.toUpperCase();
      if (this.type === 'ARRAY' && _lodash2.default.isString(obj.of)) {
        if (!CubbieDescription.isValidType(obj.of)) return console.error('Invalid type: ' + obj.of);
        this.of = obj.of.toUpperCase();
      }
    }
    if (obj.types && _lodash2.default.isArray(obj.types)) {
      if (!obj.types.length) return console.error('Cannot pass an empty array to "types"');
      var invalidType = _lodash2.default.find(obj.types, function (type) {
        return !CubbieDescription.isValidType(type);
      });
      if (invalidType) return console.error('Invalid type: ' + invalidType);
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