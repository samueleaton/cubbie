# Freezing the State Structure

> Brrrrrrr...

The `freeze` method will prevent:

- Adding properties to the state
- Removing properties from the state
- Converting object or array to another type

*NOTE:* The frozen state is not enforced if `NODE_ENV` is `production`.

Example

``` javascript
store.setInitialState({
  people: [{name: 'sam', age: 25}],
  currentPerson: {name: 'sam', age: 25}
});

store.freeze();

store.modifyState(state => {
  state.company = "Qualtrics";
}); // aborts, cannot add property to frozen state

store.modifyState(state => {
  state.people = null;
}); // aborts, cannot convert array to a non-array or non-object

store.modifyState(state => {
  state.currentPerson.favoriteColor = null;
}); // aborts, cannot add property to frozen state
```

Example

``` javascript
store.setInitialState({
  people: [{name: 'sam', age: 25}],
  currentPerson: {name: 'sam', age: 25}
}).freeze();

/*
  THESE STILL WORK SUCCESSFULLY
*/

store.modifyState(state => {
  state.people.push({name: 'mike', age: 32})
});

store.modifyState(state => {
  state.people.currentPerson = {name: 'Jack', age: 24};
});
```
