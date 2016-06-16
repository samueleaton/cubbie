'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var crypter = {
  encrypt: function encrypt(str, secret) {
    var algorithm = arguments.length <= 2 || arguments[2] === undefined ? 'aes-256-ctr' : arguments[2];

    var cipher = _crypto2.default.createCipher(algorithm, secret);
    var encryptedString = cipher.update(str, 'utf8', 'hex');
    encryptedString += cipher.final('hex');
    return encryptedString;
  },
  decrypt: function decrypt(str, secret) {
    var algorithm = arguments.length <= 2 || arguments[2] === undefined ? 'aes-256-ctr' : arguments[2];

    var decipher = _crypto2.default.createDecipher(algorithm, secret);
    var decryptedString = decipher.update(str, 'hex', 'utf8');
    decryptedString += decipher.final('utf8');
    return decryptedString;
  },
  isEncryptionEnabled: function isEncryptionEnabled(configObj) {
    return (typeof _crypto2.default === 'undefined' ? 'undefined' : _typeof(_crypto2.default)) === 'object' && typeof _crypto2.default.createCipher === 'function' && typeof _crypto2.default.createDecipher === 'function' && typeof configObj !== 'undefined' && _typeof(configObj.encryption) === 'object' && typeof configObj.encryption.secret === 'string';
  }
};

exports.default = crypter;