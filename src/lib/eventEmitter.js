/* EVENT EMITTER
*/
import _ from 'lodash';

class CubbieEventEmitter {
  constructor() {
    this.events = {
      'STATE_SET': [],
      'STATE_RESET': [],
      'STATE_REVERTED': [],
      'STATE_MODIFIED': [],
      'STATE_PROBED': [],
      'STATE_COMMITTED': [],
      'STATE_RELOADED': []
    };
    this.stateEvents = [
      'STATE_SET',
      'STATE_RESET',
      'STATE_REVERTED',
      'STATE_MODIFIED',
      'STATE_PROBED',
      'STATE_COMMITTED',
      'STATE_RELOADED'
    ];
    _.each(this.stateEvents, evt => { this.events[evt] = [] });
  }
  on(arg, cb) {
    const args = _.isArray(arg) ? arg : [ arg ] ;
    if (typeof cb !== 'function')
      return console.error('Cubbie Error: Last param to "on" must be of type "function".');
    _.each(args, evt => {
      if (!_.isArray(this.events[evt]))
        this.events[evt] = [];
      this.events[evt].push(cb);
    });
  }
  once(arg, cb) {
    const args = _.isArray(arg) ? arg : [ arg ] ;
    if (typeof cb !== 'function')
      return console.error('Cubbie Error: Last param to "on" must be of type "function".');
    _.each(args, evt => {
      if (!_.isArray(this.events[evt]))
        this.events[evt] = [];
      
      const callback = (...args) => {
        cb(...args);
        const index = this.events[evt].indexOf(callback);
        this.events[evt][index] = null; // after running, make callback null
      };

      this.events[evt].push(callback);
    });
  }
  emit(evt, ...args) {
    if (!this.events[evt])
      return;
    else {
      _.each(this.events[evt], cb => {
        if (cb) return cb(...args)
      });
    }
  }
}

export default CubbieEventEmitter;
