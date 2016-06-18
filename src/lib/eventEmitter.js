/* eslint-disable id-length */
/* EVENT EMITTER
*/
import _ from 'lodash';

class CubbieEventEmitter {
  constructor() {
    this.events = {
      STATE_SET: [],
      STATE_RESET: [],
      STATE_REVERTED: [],
      STATE_MODIFIED: [],
      STATE_PROBED: [],
      STORE_COMMITTED: [],
      STORE_FETCHED: []
    };
    this.stateEvents = [
      'STATE_SET',
      'STATE_RESET',
      'STATE_REVERTED',
      'STATE_MODIFIED',
      'STATE_PROBED',
      'STORE_COMMITTED',
      'STORE_FETCHED'
    ];
    _.each(this.stateEvents, evt => { this.events[evt] = []; });
  }
  on(arg, evtCb) {
    const args = _.isArray(arg) ? arg : [ arg ];
    if (typeof evtCb !== 'function')
      return console.error('Cubbie Error: Last param to "on" must be of type "function".');
    _.each(args, evt => {
      if (!_.isArray(this.events[evt]))
        this.events[evt] = [];
      this.events[evt].push(evtCb);
    });
  }
  once(arg, evtCb) {
    const args = _.isArray(arg) ? arg : [ arg ];
    if (typeof evtCb !== 'function')
      return console.error('Cubbie Error: Last param to "on" must be of type "function".');
    _.each(args, evt => {
      if (!_.isArray(this.events[evt]))
        this.events[evt] = [];
      
      const onceCb = (...cbArgs) => {
        evtCb(...cbArgs);
        const index = this.events[evt].indexOf(onceCb);

        // after running, make callback null
        this.events[evt][index] = null;
      };

      this.events[evt].push(onceCb);
    });
  }
  emit(evt, ...args) {
    if (!this.events[evt])
      return;
    _.each(this.events[evt], evtCb => {
      if (evtCb)
        return evtCb(...args);
    });
  }
}

export default CubbieEventEmitter;
