import crypter from './crypter';
import _ from 'lodash';
import cleanStore from './cleanStore';

let fs = {};

if (typeof process !== 'undefined' && process.env)
  fs = require('fs'); // eslint-disable-line
else
  fs = require('./empty'); // eslint-disable-line

/*
*/
function isFsAvailable() {
  return (
    typeof fs === 'object' &&
    typeof fs.readFile === 'function' &&
    typeof fs.writeFile === 'function' &&
    fs.readFile.length === 3 &&
    fs.writeFile.length === 4
  );
}

/*
*/
function writeStore({ storeArray, eventEmitter, configObj, commitConfig }) {
  if (!storeArray || !eventEmitter || !configObj || !commitConfig)
    return console.error('Missing param');

  try {
    const stringifiedStateHist = stringifyStateHistory(storeArray, configObj, commitConfig);
    fs.writeFile(configObj.file, stringifiedStateHist + '\n', 'utf8', writeError => {
      if (writeError)
        return console.error(writeError);
      eventEmitter.emit('STORE_COMMITTED');
    });
  }
  catch (writeError) {
    console.error(writeError);
  }
}

/*
*/
function fetchStoreContents(configObj, fetchCb) {
  try {
    fs.readFile(configObj.file, 'utf8', (readErr, fileData) => {
      fetchCb(readErr, parseStateHistory(fileData.trim(), configObj));
    });
  }
  catch (readErr) {
    console.error(readErr);
  }
}

/*
*/
function stringifyStateHistory(stateHistory, configObj, commitConfig = {}) {
  let storeStr;
  try {
    const pretty = commitConfig.pretty === true;
    const store = commitConfig.clean === true ? cleanStore(stateHistory) : stateHistory;
    storeStr = JSON.stringify(store, null, pretty && 2);
  }
  catch (stringifyErr) {
    return console.error(stringifyErr);
  }
  
  if (crypter.isEncryptionEnabled(configObj)) {
    return crypter.encrypt(
      storeStr, configObj.encryption.secret, configObj.encryption.algorithm
    );
  }
  else
    return storeStr;
}

/*
*/
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
    if (stateHistStr.match(/[^\s]/g))
      console.error(parseError);
    return null;
  }
  return stateHistObj || null;
}

/*
*/
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

/*
  if both stores have data, decide how to commit
*/
function commitDiff({ stateHistory, fileStore, eventEmitter, configObj, commitConfig }) {
  if (!stateHistory || !fileStore || !eventEmitter || !configObj || !commitConfig)
    return console.error('Missing param');

  const file = configObj.file;
  const fileStoreInitialState = fileStore.find(state => state.isInitialState);
  const stateHistoryInitialState = stateHistory.find(state => state.isInitialState);

  // file doesn't have an inital state, overwrite it
  if (!fileStoreInitialState) {
    console.warn(`Cubbie Warning: ${file} doesn't have an initial state. Overwriting it.`);
    return writeStore({
      storeArray: stateHistory,
      eventEmitter,
      configObj,
      commitConfig
    });
  }

  // both stores have same inital state, write it
  else if (fileStoreInitialState.id === stateHistoryInitialState.id) {
    writeStore({
      storeArray: stateHistory,
      eventEmitter,
      configObj,
      commitConfig
    });
  }

  // conflicting inital states
  else {
    console.error(
      `Cubbie Warning: ${file} and currrent initial state id's conflict. Commit aborted. ` +
      `To force overwrite, do 'commit({ hard: true })'`
    );
  }
}

/*
*/
function commitStore({ stateHistory, eventEmitter, configObj, commitConfig }) {
  if (!stateHistory || !eventEmitter || !configObj || !commitConfig)
    return console.error('Missing param');

  const stateHistoryInitialState = stateHistory.find(state => state.isInitialState);

  if (!stateHistory.length) {
    console.warn(`Cubbie Warning: current stateHistory empty Aborting commit...`);
    return;
  }
  
  // no inital state in current state history. Cannot overwrite store
  if (!stateHistoryInitialState) {
    console.warn(`Cubbie Warning: current stateHistory has no initalState. Aborting commit...`);
    return;
  }
  
  // if hard commit enabled, just overwrite the f**ker
  if (_.isPlainObject(commitConfig) && commitConfig.hard === true) {
    return writeStore({
      storeArray: stateHistory,
      eventEmitter,
      configObj,
      commitConfig
    });
  }
  else {
    fetchStoreContents(configObj, (fetchErr, fileStore) => {
      // if read error or files store is empty
      if (fetchErr || !_.isArray(fileStore) || !fileStore.length) {
        return writeStore({
          storeArray: stateHistory,
          eventEmitter,
          configObj,
          commitConfig
        });
      }

      // both stores have data
      else
        commitDiff({ stateHistory, fileStore, eventEmitter, configObj, commitConfig });
    });
  }
}

/*
*/
function fetchStore(configObj, fetchCb) {
  fetchStoreContents(configObj, (fetchErr, storeObj) => {
    if (fetchErr)
      return console.error(fetchErr);
    fetchCb(storeObj);
  });
}

module.exports = {
  isFsAvailable, initStorage, commitStore, fetchStore
};
