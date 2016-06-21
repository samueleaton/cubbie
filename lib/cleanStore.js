import _ from 'lodash';

export default function clean(store) {
  if (!_.isArray(store))
    return console.error('Cubbie Error: Cannot run cleaner on non-array');
  let currentBaseIndex = 0;
  let currentMatchIndex = 0;

  function runCleaner(storeArr) {
    if (currentBaseIndex >= storeArr.length)
      return;
    
    // top level loop from left
    _.find(storeArr, (baseStateObj, baseIndex) => {
      currentBaseIndex = baseIndex;

      // inner loop from right
      const i = _.findLastIndex(storeArr, (matchStateObj, matchIndex) => {
        currentMatchIndex = matchIndex;
        if (currentMatchIndex === currentBaseIndex) return true;
        if (_.isEqual(baseStateObj.state, matchStateObj.state)) return true;
      });

      if (i !== -1 && currentBaseIndex !== currentMatchIndex) {
        storeArr.splice(currentBaseIndex, currentMatchIndex - currentBaseIndex);
        currentBaseIndex++;
        return true;
      }
    }, currentBaseIndex);

    // if havn't looped
    if (currentBaseIndex < storeArr.length - 1)
      return runCleaner(storeArr);
    return storeArr;
  }
  return runCleaner(store);
}
