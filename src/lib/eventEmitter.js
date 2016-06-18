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
      STORE_FETCHED: [],
      namespaces: {}
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
    this.eventLogging = false;
  }
  buildEventNamespaceTree(treeInProgress, namespaceObj) {
    _.forOwn(namespaceObj, (val, key) => {
      if (_.isPlainObject(val)) {
        treeInProgress[key] = {};
        this.buildEventNamespaceTree(treeInProgress[key], namespaceObj[key]);
      }
      else if (_.isFunction(val)) {
        if (!_.isArray(treeInProgress[key]))
          treeInProgress[key] = [];
        treeInProgress[key].push(val);
      }
      else
        throw new Error(`Invalid value (${val}) for event namespace (${key})`);
    });
  }
  on(arg, evtCb) {
    if (arg === 'namespaces' || (_.isArray(arg) && _.includes(arg, 'namespaces')))
      return console.error('Cubbie Error: cannot use reserved event name `namespaces`');
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
    if (arg === 'namespaces' || (_.isArray(arg) && _.includes(arg, 'namespaces')))
      return console.error('Cubbie Error: cannot use reserved event name `namespaces`');
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
  setEventNamespace(namespace, namespaceObj) {
    if (this.events.namespaces[namespace])
      throw new Error(`Cubbie: event namespace (${namespace}) already exists`);
    if (!_.isPlainObject(namespaceObj))
      throw new Error(`Cubbie: second paramter to setEventNamespace must be an object`);
    this.events.namespaces[namespace] = {};
    this.buildEventNamespaceTree(this.events.namespaces[namespace], namespaceObj);
  }
  emit(evt, ...args) {
    if (this.eventLogging) {
      console.log(
        '%cCubbie Event: %c' + evt,
        'color:#21AE83;font-weight:200;font-size:8px;',
        'color:#B8F1E0;font-weight:400;font-size:11px;background-color:#1C9470;padding:2px 3px;'
      );
    }
    if (!_.isArray(this.events[evt]) && !_.isArray(_.get(this.events.namespaces, evt)))
      return;
    if (this.events[evt]) {
      _.each(this.events[evt], evtCb => {
        if (evtCb)
          return evtCb(...args);
      });
    }
    if (_.get(this.events.namespaces, evt)) {
      _.each(_.get(this.events.namespaces, evt), evtCb => {
        if (evtCb)
          return evtCb(...args);
      });
    }
  }
  eventLoggingActive(bool) {
    if (!_.isBoolean(bool))
      return console.error('Cubbie Error: eventLogging takes a boolean');
    this.eventLogging = bool;
  }
}

export default CubbieEventEmitter;
