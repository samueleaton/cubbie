# Cleaning the Store 

### Usage

``` javascript
store.clean();
```

Cleaning the store is an easy but advanced way to keep the store from getting unreasonably large.

It looks at each state snapshot and will attempt to find an identical state. If it does, it will consider everything in between as *"beating around the bush"* (seeing as you ended up at a state that had already occurred) and will remove the first duplicate plus all of the states in between.

Consider the following illustration:

<img alt="cubbie clean" title="cubbie clean" src="https://raw.githubusercontent.com/samueleaton/design/master/cubbie_clean.png">  

In the image, we see that there are 2 `S` states and 2 `X` states. The `D`, `W`, `R`, and `L` states are all pointless because they are between 2 identical states (we traveled in full circle). The `clean` method will remove all of the states between identical states, and will also remove the earlier of the two identical state.

Put simply, `clean` will remove duplicate states and everything in between.
