### State Description: Enforcing Types and/or Values

If you want to enforce types and/or values, you can do so by describing the state.

The state description is made for convenience during development, so any described states will not be enforced or checked if `NODE_ENV=production`.

There are 2 important methods: `describeState` and `describe`.

Use the `describeState` method (or the `stateDescription` setter) to initialize the state description. Use `describe` to describe a specific field.

``` javascript
store.describeState({});
// or
store.stateDescription = {};
```

Example

``` javascript
const desc = require('cubbie').describe;

store.describeState({
  name: desc({ type: 'String' }),
  age: desc({ types: ['Number', 'Null'] }),
  pet: {
    name: desc({ type: 'String' }),
    kind: desc({ values: ['cat', 'dog'] })
  }
});

store.setInitialState({
  name: 'Sam',
  age: 25,
  pet: {
    name: 'Izzy',
    kind: 'cat',
    breed: 'tabby' // not described, so can be ANY value
  }
});

store.freeze(); // optional

```

You don't have to describe every single piece of the state.

##### About the `describe` Method

**There are four properties for `describe`:**
- **`type`** - A single string
- **`types`** - An array of types
- **`values`** - An array of values
- **`of`** - Can specify the types of elements in an array if `type` is `Array`

``` javascript
// describes state as an array of numbers
store.describeState({
  myNumbers: desc({ type: 'Array', of: 'Number' })
});
```

`type` and `types` cannot be used in the same description object for the same property.

**The following are valid types to use as a `type` or in `types` (NOT case-sensitive):**
- `'Array'`
- `'Boolean'`
- `'Date'`
- `'Element'`
- `'Function'`
- `'Null'`
- `'Number'`
- `'Object'`
- `'RegExp'`
- `'String'`
- `'Symbol'`
- `'Undefined'`