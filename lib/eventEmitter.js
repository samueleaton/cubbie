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
      STORE_PROBED: [],
      STORE_PURGED: [],
      STORE_COMMITTED: [],
      STORE_FETCHED: [],
      namespaces: {}
    };
    this.cubbieEvents = [
      'STATE_SET',
      'STATE_RESET',
      'STATE_REVERTED',
      'STATE_MODIFIED',
      'STORE_PROBED',
      'STORE_PURGED',
      'STORE_COMMITTED',
      'STORE_FETCHED'
    ];
    _.forEach(this.cubbieEvents, evt => { this.events[evt] = []; });
    this.eventLogging = false;
    this.eventLoggingName = null;
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
    _.forEach(args, evt => {
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
      return console.error('Cubbie Error: Last param to "once" must be of type "function".');
    _.forEach(args, evt => {
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
  off(arg, evtCb) {
    const args = _.isArray(arg) ? arg : [ arg ];
    if (typeof evtCb !== 'function' && typeof evtCb !== 'undefined')
      return console.error('Cubbie Error: Last param to "off" must be of type "function".');

    _.forEach(args, evt => {
      // no listeners, return
      if (!_.isArray(this.events[evt]))
        return;
      else if (evtCb)
        _.remove(this.events[evt], func => func === evtCb);
      // if no callback given, remove all listeners
      else
        this.events[evt].splice(0);
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
  doesEventHaveListensers(evt) {
    return (
      // top level event
      (
        _.isArray(this.events[evt]) &&
        _.compact(this.events[evt]).length
      ) ||
      // namespaced event
      (
        _.isArray(_.get(this.events.namespaces, evt)) &&
        _.get(this.events.namespaces, evt).length
      ) ||
      // globally namespaced event
      (
        _.isArray(_.get(this.events.namespaces.global, evt)) &&
        _.get(this.events.namespaces.global, evt).length
      )
    );
  }
  logEvent(evt) {
    const storeName = this.eventLoggingName || 'Cubbie';
    const labelBaseStyles = `font-weight:200;font-size:8px;`;
    const eventBaseStyles = `font-weight:400;font-size:11px;padding:2px 3px;`;

    // if state event
    if (_.includes(this.cubbieEvents, evt)) {
      console.log(
        `%c${storeName} Event: %c${evt}`,
        `${labelBaseStyles}color:#753FD3;`,
        `${eventBaseStyles}color:#DED0F6;background-color:#6326CC;`
      );
    }
    // if listener(s)
    else if (this.doesEventHaveListensers(evt)) {
      console.log(
        `%c${storeName} Event: %c${evt}`,
        `${labelBaseStyles}color:#21AE83;`,
        `${eventBaseStyles}color:#B8F1E0;background-color:#1C9470;`
      );
    }
    // if NO listener(s)
    else {
      console.log(
        `%c${storeName} Event: %c${evt}`,
        `${labelBaseStyles}color:#D57739;`,
        `${eventBaseStyles}color:#F7E3D5;background-color:#CC6B26;`
      );
    }
  }
  emit(evt, ...args) {
    if (this.eventLogging)
      this.logEvent(evt);

    /* ~~~ Return if no listeners ~~~ */
    if (
      !_.isArray(this.events[evt]) &&
      !_.isArray(_.get(this.events.namespaces, evt)) &&
      !_.isArray(_.get(this.events.namespaces.global, evt))
    )
      return;

    /* ~~~ Emit any relevant listeners ~~~ */
    if (this.events[evt]) {
      _.forEach(this.events[evt], evtCb => {
        if (evtCb)
          return evtCb(...args);
      });
    }
    if (_.get(this.events.namespaces, evt)) {
      _.forEach(_.get(this.events.namespaces, evt), evtCb => {
        if (evtCb)
          return evtCb(...args);
      });
    }
    if (_.get(this.events.namespaces.global, evt)) {
      _.forEach(_.get(this.events.namespaces.global, evt), evtCb => {
        if (evtCb)
          return evtCb(...args);
      });
    }
  }
  enableEventLogging(str) {
    this.eventLogging = true;
    this.eventLoggingName = str;
  }
  disableEventLogging() {
    this.eventLogging = false;
    this.eventLoggingName = null;
  }
}

export default CubbieEventEmitter;
