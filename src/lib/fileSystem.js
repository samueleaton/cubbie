import fs from 'fs';
import crypter from './crypter';

function isFsAvailable() {
  return (
    typeof fs === 'object' &&
    typeof fs.readFile === 'function' &&
    typeof fs.writeFile === 'function' &&
    fs.readFile.length === 3 &&
    fs.writeFile.length === 4
  );
}

function stringifyState(state, configObj, format) {
  let stateStr;
  try {
    stateStr = JSON.stringify(state, null, format);
  }
  catch (stringifyErr) {
    return console.error(stringifyErr);
  }
  
  if (crypter.isEncryptionEnabled(configObj)) {
    return crypter.encrypt(
      stateStr, configObj.encryption.secret, configObj.encryption.algorithm
    );
  }
  else
    return stateStr;
}

function parseState(state, configObj) {
  let stateStr;
  if (crypter.isEncryptionEnabled(configObj)) {
    stateStr = crypter.decrypt(
      state, configObj.encryption.secret, configObj.encryption.algorithm
    );
  }
  else
    stateStr = state;
  
  let stateObj;
  try {
    stateObj = JSON.parse(stateStr);
  }
  catch (parseError) {
    return console.error(parseError);
  }
  return stateObj;
}

function initStorage(configObj) {
  try {
    const contents = fs.readFileSync(configObj.file, 'utf8');
  }
  catch (readError) {
    try {
      fs.writeFileSync(configObj.file, '', 'utf8');
    }
    catch (writeError) {
      console.error('Could not initialize file storage');
    }
  }
}

function commitState(eventEmitter, state, configObj, format = '') {
  try {
    const stringifiedState = stringifyState(state, configObj, format);
    fs.writeFile(configObj.file, stringifiedState + '\n', 'utf8', writeError => {
      if (writeError)
        return console.error(writeError);
      eventEmitter.emit('STATE_COMMITTED');
    });
  }
  catch (writeError) {
    console.error(writeError);
  }
}

function reloadState(configObj, reloadCb) {
  try {
    fs.readFile(configObj.file, 'utf8', (readErr, fileData) => {
      if (readErr)
        return console.error(readErr);
      reloadCb(parseState(fileData.trim(), configObj));
    });
  }
  catch (readErr) {
    console.error(readErr);
  }
}

module.exports = {
  isFsAvailable, initStorage, commitState, reloadState
};
