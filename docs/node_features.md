# Additional Features for Node

<img width="180" src="https://raw.githubusercontent.com/samueleaton/design/master/cubbie_plus_node.png">    

> Cubbie + Node = code à la mode

<br />

### Persisting the Store on Disk

To be able to sync the state to disk, define a `file` path when creating a store.

Example

``` javascript
const store = cubbie.createStore({ file: 'path/to/file' });
```

This will create the file if it doesn't exist but it will not write any contents to the file.

**Saving the State to a File**

To write the contents of the file, run the `commitState` method.

Example

``` javascript
const store = cubbie.createStore({ file: 'path/to/file' });
store.setInitialState({/*...*/});
store.commitState();
```

This will trigger the `STATE_COMMITTED` event.

**Loading the State from a File**

To read in the contents of the file, run the `reloadState` method.

Example

``` javascript
const store = cubbie.createStore({ file: 'path/to/file' });
store.setInitialState({/*...*/});
store.commitState();
/*...*/
store.reloadState();
```

This will trigger the `STATE_RELOADED` event.

### Encryption

To enable encryption pass an `encryption` object to the `createStore` method with the properties`secret` and `algorithm` (optional / default algorithm is `aes-256-ctr`).

Example

``` javascript
const store = cubbie.createStore({
    file: 'path/to/file',
    encryption: {
        secret: 'sredqrTTsQF32SLPKlb4n53VyJJBmTWy',
        algorithm: 'aes-256-ctr' // optional
    }
});
store.setInitialState({/*...*/});
store.commitState();
/*...*/
store.reloadState();
```

This will cause cubbie to decrypt on `reloadState` and to encrypt on `commitState` before reading to or writing from disk
