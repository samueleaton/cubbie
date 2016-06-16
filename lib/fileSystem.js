'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _crypter = require('./crypter');

var _crypter2 = _interopRequireDefault(_crypter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isFsAvailable() {
  return (typeof _fs2.default === 'undefined' ? 'undefined' : _typeof(_fs2.default)) === 'object' && typeof _fs2.default.readFile === 'function' && typeof _fs2.default.writeFile === 'function' && _fs2.default.readFile.length === 3 && _fs2.default.writeFile.length === 4;
}

function stringifyState(state, configObj, format) {
  var stateStr = void 0;
  try {
    stateStr = JSON.stringify(state, null, format);
  } catch (stringifyErr) {
    return console.error(stringifyErr);
  }

  if (_crypter2.default.isEncryptionEnabled(configObj)) {
    return _crypter2.default.encrypt(stateStr, configObj.encryption.secret, configObj.encryption.algorithm);
  } else return stateStr;
}

function parseState(state, configObj) {
  var stateStr = void 0;
  if (_crypter2.default.isEncryptionEnabled(configObj)) {
    stateStr = _crypter2.default.decrypt(state, configObj.encryption.secret, configObj.encryption.algorithm);
  } else stateStr = state;

  var stateObj = void 0;
  try {
    stateObj = JSON.parse(stateStr);
  } catch (parseError) {
    return console.error(parseError);
  }
  return stateObj;
}

function initStorage(configObj) {
  try {
    var contents = _fs2.default.readFileSync(configObj.file, 'utf8');
  } catch (readError) {
    try {
      _fs2.default.writeFileSync(configObj.file, '', 'utf8');
    } catch (writeError) {
      console.error('Could not initialize file storage');
    }
  }
}

function commitState(eventEmitter, state, configObj) {
  var format = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];

  try {
    var stringifiedState = stringifyState(state, configObj, format);
    _fs2.default.writeFile(configObj.file, stringifiedState + '\n', 'utf8', function (writeError) {
      if (writeError) return console.error(writeError);
      eventEmitter.emit('STATE_COMMITTED');
    });
  } catch (writeError) {
    console.error(writeError);
  }
}

function reloadState(configObj, reloadCb) {
  try {
    _fs2.default.readFile(configObj.file, 'utf8', function (readErr, fileData) {
      if (readErr) return console.error(readErr);
      reloadCb(parseState(fileData.trim(), configObj));
    });
  } catch (readErr) {
    console.error(readErr);
  }
}

module.exports = {
  isFsAvailable: isFsAvailable, initStorage: initStorage, commitState: commitState, reloadState: reloadState
};