import _ from 'lodash';
import revertDiffChanges from './revertDiffChanges';

/*
*/
export default function generateFriendlyStateHistory(rawStateHistory) {
  const history = [];
  _.forEachRight(rawStateHistory, (stateObj, i) => {
    if (i > 0 && i < rawStateHistory.length - 1)
      history.unshift(revertDiffChanges(history[0], stateObj.state));
    else
      history.unshift(_.cloneDeep(stateObj.state));
  });
  return history;
}
