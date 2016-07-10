# Cubbie Backlog

Backlog to reach v2.0.1:

- [x] Fix where log will no longer show orange if `once` method used
- [x] Update `once` method to actually remove the listener once it is ran instead of it just being ignored
- [x] implement a deep freeze and do not ever clone current state

Backlog to reach v3.0.0:

- [x] Change purgeStateHistory so that it sets the current state as the new initial state and remove the state history (don't preserve the original initialState)
- [x] Change `store.stateEvents` to `store.cubbieEvents`
- [x] Change the `STATE_PROBED` event to `STORE_PROBED`
