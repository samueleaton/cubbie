/* eslint-disable complexity */
import _ from 'lodash';
import generateUUID from './generateUUID';

export default class CubbieState {
  static toCubbieState(stateObj) {
    if (stateObj instanceof CubbieState)
      return stateObj;
    else if (_.isPlainObject(stateObj))
      return new CubbieState(stateObj);
    else
      throw new Error('Cannot convert to CubbieState. Invalid Format.');
  }
  constructor({ state, id, timestamp, isInitialState }) {
    if (!_.isObjectLike(state))
      throw new Error('CubbieState must be object like');
    this.id = id || generateUUID();
    this.timestamp = timestamp || Date.now();
    this.state = state;
    this.isInitialState = isInitialState || false;
  }
}
