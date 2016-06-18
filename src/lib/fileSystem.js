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

function stringifyStateHistory(state, configObj) {
  let stateStr;
  try {
    const pretty = configObj.pretty === true;
    stateStr = JSON.stringify(state, null, pretty && 2);
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

function parseStateHistory(stateHist, configObj) {
  let stateHistStr;
  if (crypter.isEncryptionEnabled(configObj)) {
    stateHistStr = crypter.decrypt(
      stateHist, configObj.encryption.secret, configObj.encryption.algorithm
    );
  }
  else
    stateHistStr = stateHist;
  
  let stateHistObj;
  try {
    stateHistObj = JSON.parse(stateHistStr);
  }
  catch (parseError) {
    return console.error(parseError);
  }
  return stateHistObj || [];
}

function initStorage(configObj) {
  /* eslint-disable no-sync */
  try {
    fs.readFileSync(configObj.file, 'utf8');
  }
  catch (readError) {
    try {
      fs.writeFileSync(configObj.file, '', 'utf8');
    }
    catch (writeError) {
      console.error('Could not initialize file storage');
    }
  }
  /* eslint-enable no-sync */
}

function commitStore(eventEmitter, stateHist, configObj) {
  try {
    const stringifiedStateHist = stringifyStateHistory(stateHist, configObj);
    fs.writeFile(configObj.file, stringifiedStateHist + '\n', 'utf8', writeError => {
      if (writeError)
        return console.error(writeError);
      eventEmitter.emit('STATE_COMMITTED');
    });
  }
  catch (writeError) {
    console.error(writeError);
  }
}

function fetchStore(configObj, reloadCb) {
  try {
    fs.readFile(configObj.file, 'utf8', (readErr, fileData) => {
      if (readErr)
        return console.error(readErr);
      reloadCb(parseStateHistory(fileData.trim(), configObj));
    });
  }
  catch (readErr) {
    console.error(readErr);
  }
}

module.exports = {
  isFsAvailable, initStorage, commitStore, fetchStore
};
