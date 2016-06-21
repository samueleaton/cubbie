let crypto = {};

if (typeof process !== 'undefined' && process.env)
  crypto = require('crypto'); // eslint-disable-line
else
  crypto = require('./empty'); // eslint-disable-line

const crypter = {
  encrypt(str, secret, algorithm = 'aes-256-ctr') {
    const cipher = crypto.createCipher(algorithm, secret);
    let encryptedString = cipher.update(str, 'utf8', 'hex');
    encryptedString += cipher.final('hex');
    return encryptedString;
  },
  decrypt(str, secret, algorithm = 'aes-256-ctr') {
    const decipher = crypto.createDecipher(algorithm, secret);
    let decryptedString = decipher.update(str, 'hex', 'utf8');
    decryptedString += decipher.final('utf8');
    return decryptedString;
  },
  isEncryptionEnabled(configObj) {
    return (
      typeof crypto === 'object' &&
      typeof crypto.createCipher === 'function' &&
      typeof crypto.createDecipher === 'function' &&
      typeof configObj !== 'undefined' &&
      typeof configObj.encryption === 'object' &&
      typeof configObj.encryption.secret === 'string'
    );
  }
};

export default crypter;
