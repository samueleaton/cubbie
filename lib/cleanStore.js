import _ from 'lodash';

/*
  MUTABLLY CLEANS THE STATE HISTORY
  ------------------------------------
  • diffedHistory is the raw state history
  • stateHistory is the friendly state history (used for comparisons)
    - stateHistory is needed because you can't iterate from the intial state
      using the diffed history
*/
export default function clean(diffedHistory, stateHistory) {
  if (!_.isArray(diffedHistory))
    return console.error('Cubbie Error: Cannot run cleaner on non-array');
  let currentBaseIndex = 0;
  let currentMatchIndex = 0;

  function runCleaner(diffedArray, stateHist) {
    if (currentBaseIndex >= diffedArray.length)
      return;
    
    // top level loop from left
    _.find(diffedArray, (baseStateObj, baseIndex) => {
      currentBaseIndex = baseIndex;

      // inner loop from right
      const i = _.findLastIndex(diffedArray, (matchStateObj, matchIndex) => {
        currentMatchIndex = matchIndex;
        if (currentMatchIndex === currentBaseIndex)
          return true;
        if (_.isEqual(stateHist[currentBaseIndex], stateHist[currentMatchIndex]))
          return true;
      });

      if (i !== -1 && currentBaseIndex !== currentMatchIndex) {
        diffedArray.splice(currentBaseIndex, currentMatchIndex - currentBaseIndex);
        stateHist.splice(currentBaseIndex, currentMatchIndex - currentBaseIndex);
        currentBaseIndex++;
        return true;
      }
    }, currentBaseIndex);

    // if havn't looped
    if (currentBaseIndex < diffedArray.length - 1)
      return runCleaner(diffedArray, stateHist);
    return diffedArray;
  }
  return runCleaner(diffedHistory, stateHistory);
}
