# Additional Features for Node

<img width="180" alt="cubbie plus node.js" title="cubbie plus node.js" src="https://raw.githubusercontent.com/samueleaton/design/master/cubbie_plus_node.png">

> Cubbie + Node = code à la mode

<br />

## Persisting the Store on Disk

To be able to sync the store to disk, define a `file` path when creating a store.

Example

``` javascript
const store = cubbie.createStore({ file: 'path/to/file' });
```

This will create the file if it doesn't exist but it will not write any contents to the file.

### Saving the Store to a File

To write the contents of the file, run the `commit` method.

Example

``` javascript
const store = cubbie.createStore({ file: 'path/to/file' });
store.setInitialState({/*...*/});
store.commit();
```

This will trigger the `STORE_COMMITTED` event.

#### Commit Options

The following can be passed to `commit`:

- **hard**: (Boolean) If true, will overwrite the current contents on disk instead of smart diffing
- **pretty**: (Boolean) If true, will write JSON contents in readable format
- **clean**: (Boolean) If true, will run the `clean` method on the store before writing it to disk (See [Cleaning the Store](cleaning_the_store.md))

Example

``` javascript
store.commit({ pretty: true, clean: true });
```

### Loading the Store from a File

To read in the contents of the file, run the `fetch` method.

Example

``` javascript
const store = cubbie.createStore({ file: 'path/to/file' });
store.setInitialState({/*...*/});
store.commit();
/*...*/
store.fetch();
```

This will merge the store from the file with current state history (even if its empty), remove duplicate states by id, and order the states by timestamp of when they were created.

Every state in Cubbie's stores is given a unique UUID and a timestamp when it is created, so you can rest assured that the merge will go smoothly.

Run `store.rawStateHistory` to see how Cubbie stores states internally.

This will trigger the `STORE_FETCHED` event.

NOTE: State descriptions are not enforced with stores fetched from a file.

#### Fetch Options

The following can be passed to `fetch`:

- **hard**: (Boolean) If true, will overwrite the current store with the fetched store instead of smart diffing/merging

Example

``` javascript
store.fetch({ hard: true });
```

### Encryption

To enable encryption pass an `encryption` object to the `createStore` method with the properties`secret` and `algorithm` (default algorithm is `aes-256-ctr`).

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
store.commit();
/*...*/
store.fetch();
```

This will cause cubbie to decrypt on `fetch` and to encrypt on `commit` before reading to or writing from disk
