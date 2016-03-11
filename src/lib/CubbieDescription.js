import _ from 'lodash';

export default class CubbieDescription {
  static doesValueMatchType(value, type) {
    if (_.isArray(type)) {
      if (_.includes(type, 'Array')) {
        if (_.isArray(value))
          return true;
      }
      if (_.includes(type, 'Boolean')) {
        if (_.isBoolean(value))
          return true;
      }
      if (_.includes(type, 'Date')) {
        if (_.isDate(value))
          return true;
      }
      if (_.includes(type, 'Element')) {
        if (_.isElement(value))
          return true;
      }
      if (_.includes(type, 'Null')) {
        if (_.isNull(value))
          return true;
      }
      if (_.includes(type, 'Number')) {
        if (_.isNumber(value))
          return true;
      }
      if (_.includes(type, 'Object')) {
        if (_.isPlainObject(value))
          return true;
      }
      if (_.includes(type, 'RegExp')) {
        if (_.isRegExp(value))
          return true;
      }
      if (_.includes(type, 'String')) {
        if (_.isString(value))
          return true;
      }
      if (_.includes(type, 'Symbol')) {
        if (_.isSymbol(value))
          return true;
      }
      if (_.includes(type, 'Undefined')) {
        if (_.isUndefined(value))
          return true;
      }
      return false;
    }
    else {
      if (type === 'Array') {
        if (!_.isArray(value))
          return false;
      }
      else if (type === 'Boolean') {
        if (!_.isBoolean(value))
          return false;
      }
      else if (type === 'Date') {
        if (!_.isDate(value))
          return false;
      }
      else if (type === 'Element') {
        if (!_.isElement(value))
          return false;
      }
      else if (type === 'Null') {
        if (!_.isNull(value))
          return false;
      }
      else if (type === 'Number') {
        if (!_.isNumber(value))
          return false;
      }
      else if (type === 'Object') {
        if (!_.isPlainObject(value))
          return false;
      }
      else if (type === 'RegExp') {
        if (!_.isRegExp(value))
          return false;
      }
      else if (type === 'String') {
        if (!_.isString(value))
          return false;
      }
      else if (type === 'Symbol') {
        if (!_.isSymbol(value))
          return false;
      }
      else if (type === 'Undefined') {
        if (!_.isUndefined(value))
          return false;
      }
      return true;
    }
  }
  static isCubbieDescription(obj) {
    return (
      obj instanceof CubbieDescription || obj.constructor === CubbieDescription
    );
  }
  constructor(obj) {
    if (!_.isPlainObject(obj)) {
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
    if (obj.type && _.isString(obj.type)) {
      this.type = obj.type;
    }
    if (obj.types && _.isArray(obj.types)) {
      this.types = obj.types;
    }
    if (!_.isUndefined(obj.values)) {
      if (_.isArray(obj.values)) {
        if (obj.values.length)
          this.values = obj.values;
        else
          console.error('"values" cannot be an empty array in "describe"');
      }
      else
        console.error('"values" must be an array in "describe"');
    }

    this.statePath = [];
  }
}
