/* eslint-disable complexity */
import _ from 'lodash';

export default class CubbieDescription {
  static doesValueMatchType(value, _typeObj) {
    const typeObj = _.isObjectLike(_typeObj) ? _typeObj : { type: _typeObj };
    if (_.isArray(typeObj.type)) {
      if (_.includes(typeObj.type, 'ARRAY')) {
        if (_.isArray(value))
          return true;
      }
      if (_.includes(typeObj.type, 'BOOLEAN')) {
        if (_.isBoolean(value))
          return true;
      }
      if (_.includes(typeObj.type, 'DATE')) {
        if (_.isDate(value))
          return true;
      }
      if (_.includes(typeObj.type, 'ELEMENT')) {
        if (_.isElement(value))
          return true;
      }
      if (_.includes(typeObj.type, 'NULL')) {
        if (_.isNull(value))
          return true;
      }
      if (_.includes(typeObj.type, 'NUMBER')) {
        if (_.isNumber(value))
          return true;
      }
      if (_.includes(typeObj.type, 'OBJECT')) {
        if (_.isPlainObject(value))
          return true;
      }
      if (_.includes(typeObj.type, 'REGEXP')) {
        if (_.isRegExp(value))
          return true;
      }
      if (_.includes(typeObj.type, 'STRING')) {
        if (_.isString(value))
          return true;
      }
      if (_.includes(typeObj.type, 'SYMBOL')) {
        if (_.isSymbol(value))
          return true;
      }
      if (_.includes(typeObj.type, 'UNDEFINED')) {
        if (_.isUndefined(value))
          return true;
      }
      if (_.includes(typeObj.type, 'FUNCTION')) {
        if (_.isFunction(value))
          return true;
      }
      return false;
    }
    else {
      if (typeObj.type === 'ARRAY') {
        if (!_.isArray(value))
          return false;
        if (
          typeObj.of &&
          _.some(value, val => !CubbieDescription.doesValueMatchType(val, typeObj.of))
        )
          return false;
      }
      else if (typeObj.type === 'BOOLEAN') {
        if (!_.isBoolean(value))
          return false;
      }
      else if (typeObj.type === 'DATE') {
        if (!_.isDate(value))
          return false;
      }
      else if (typeObj.type === 'ELEMENT') {
        if (!_.isElement(value))
          return false;
      }
      else if (typeObj.type === 'NULL') {
        if (!_.isNull(value))
          return false;
      }
      else if (typeObj.type === 'NUMBER') {
        if (!_.isNumber(value))
          return false;
      }
      else if (typeObj.type === 'OBJECT') {
        if (!_.isPlainObject(value))
          return false;
      }
      else if (typeObj.type === 'REGEXP') {
        if (!_.isRegExp(value))
          return false;
      }
      else if (typeObj.type === 'STRING') {
        if (!_.isString(value))
          return false;
      }
      else if (typeObj.type === 'SYMBOL') {
        if (!_.isSymbol(value))
          return false;
      }
      else if (typeObj.type === 'UNDEFINED') {
        if (!_.isUndefined(value))
          return false;
      }
      else if (typeObj.type === 'FUNCTION') {
        if (!_.isFunction(value))
          return false;
      }
      return true;
    }
  }
  static isCubbieDescription(descObj) {
    return (
      descObj instanceof CubbieDescription || descObj.constructor === CubbieDescription
    );
  }
  static getType(value) {
    if (_.isArray(value))
      return 'ARRAY';
    else if (_.isBoolean(value))
      return 'BOOLEAN';
    else if (_.isDate(value))
      return 'DATE';
    else if (_.isElement(value))
      return 'ELEMENT';
    else if (_.isNull(value))
      return 'NULL';
    else if (_.isNumber(value))
      return 'NUMBER';
    else if (_.isPlainObject(value))
      return 'OBJECT';
    else if (_.isRegExp(value))
      return 'REGEXP';
    else if (_.isString(value))
      return 'STRING';
    else if (_.isSymbol(value))
      return 'SYMBOL';
    else if (_.isUndefined(value))
      return 'UNDEFINED';
    else if (_.isFunction(value))
      return 'FUNCTION';
    else
      return value.contructor.prototype;
  }
  static isValidType(type) {
    return _.includes([
      'ARRAY',
      'BOOLEAN',
      'DATE',
      'ELEMENT',
      'NULL',
      'NUMBER',
      'OBJECT',
      'REGEXP',
      'STRING',
      'SYMBOL',
      'UNDEFINED',
      'FUNCTION'
    ], type.toUpperCase());
  }

  constructor(descriptionObj) {
    if (!_.isPlainObject(descriptionObj))
      return console.error('Must pass object to "describe"');
    if (!descriptionObj.type && !descriptionObj.types && !descriptionObj.values)
      return console.error('Must specify type, types, or values with "describe"');
    if (descriptionObj.type && descriptionObj.types)
      return console.error('Cannot specify both "type" and "types" with "describe"');
    if (descriptionObj.type && _.isString(descriptionObj.type)) {
      if (!CubbieDescription.isValidType(descriptionObj.type))
        return console.error('Invalid type: ' + descriptionObj.type);
      this.type = descriptionObj.type.toUpperCase();
      if (this.type === 'ARRAY' && _.isString(descriptionObj.of)) {
        if (!CubbieDescription.isValidType(descriptionObj.of))
          return console.error('Invalid type: ' + descriptionObj.of);
        this.of = descriptionObj.of.toUpperCase();
      }
    }
    if (descriptionObj.types && _.isArray(descriptionObj.types)) {
      if (!descriptionObj.types.length)
        return console.error('Cannot pass an empty array to "types"');
      const invalidType = _.find(
        descriptionObj.types, type => !CubbieDescription.isValidType(type)
      );
      if (invalidType)
        return console.error('Invalid type: ' + invalidType);
      this.types = descriptionObj.types;
    }
    if (!_.isUndefined(descriptionObj.values)) {
      if (_.isArray(descriptionObj.values)) {
        if (descriptionObj.values.length)
          this.values = descriptionObj.values;
        else
          console.error('"values" cannot be an empty array in "describe"');
      }
      else
        console.error('"values" must be an array in "describe"');
    }

    this.statePath = [];
  }
}
