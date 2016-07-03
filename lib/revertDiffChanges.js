import _ from 'lodash';
import { revertChange } from 'deep-diff';

export default function revertDiffChanges(sourceObj, diffs) {
  const clone = _.cloneDeep(sourceObj);
  _.forEach(diffs, diffObj => revertChange(clone, sourceObj, diffObj));
  return clone;
}
