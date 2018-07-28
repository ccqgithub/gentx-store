import {invariant, log} from './utils';

export default class GentStore {

  // constructor
  constructor(options={}) {
    this._check(options);
    
    this._isGentStore = true;
    this.debug = !!options.debug;
    this.name = options.name || 'GentStore';
    this._state = options.initialState || {};
    this._transactions = options.transactions || {};
    this._modules = options.modules || {};
    this._snapshot = options.snapshot || function(data) {
      return JSON.parse(JSON.stringify(data));
    }
    this._observers = [];
  }

  _check(options) {
    let sotreName = this.name;

    invariant(
      typeof options === 'object',
      `gentx-store error ~ <${sotreName}>'s options must be an object!`
    );

    let initialState = options.initialState;
    invariant(
      !initialState || typeof initialState === 'object',
      `gentx-store error ~ <${sotreName}>'s options.initialState must be an object!`
    );

    let transactions = options.transactions;
    invariant(
      !transactions || typeof transactions === 'object',
      `gentx-store error ~ <${sotreName}>'s options.transactions must be an object!`
    );

    let snapshot = options.snapshot;
    invariant(
      !snapshot || typeof snapshot === 'function',
      `gentx-store error ~ <${sotreName}>'s options.snapshot must be an function!`
    )

    let modules = options.modules || {};
    invariant(
      modules && typeof modules === 'object',
      `gentx-store error ~ <${sotreName}>'s options.modules is must be object!`
    );

    Object.keys(modules).forEach(key => {
      let module = modules[key];
      invariant(
        typeof module === 'object' && module._isGentStore,
        `gentx-store error ~ <${sotreName}>'s module <${key}> must be a store instance!`
      );
    });
  }

  // subscribe
  subscribe(observer) {
    let observers = this._observers;
    if (typeof observer === 'function') {
      observer = {next: observer};
    }
    observers.push({
      observer
    });
    
    return {
      unsubscribe() {
        let i = observers.indexOf(observer);
        observers.splice(i, 1);
      }
    }
  }

  // get store's state
  getState() {
    let state = this._state;

    Object.keys(this._modules).forEach(moduleName => {
      state[moduleName] = this._modules[moduleName].getState();
    });

    return state;
  }

  /**
   * Get child module
   * @param {String} mName 
   */
  getChildModule(mName) {
    return this._modules[mName];
  }

  /**
   * clone a node in state, internal use: `options.snapshot` or `JSON.parse(JSON.stringify(node))`
   * let userList = store.copy('user.list');
   */
  copy(path) {
    let arr = path ? path.split('.') : [];
    let find = this.state;

    while (typeof find === 'object' && arr.length) {
      find = find[arr.shift()];
    }
      
    // not found
    if (arr.length) return null;

    return this._snapshot(find);
  }

  /**
   * [commit description]
   * store.commit('main.user.add', {username: ''})
   */
  commit(tsName, payload, parent='') {
    let arr = tsName.split('.', 2);
    let location = parent ? parent + '.' + arr[0] : arr[0];
    let storeName = this.name;

    // log
    if (this.debug && !parent) {
      console.log(`gentx-store log ~ <${storeName}> commit <${tsName}>`, this._snapshot(payload));
    }

    // module
    if (arr.length > 1) {
      let moduleName = arr[0];
      let module = this._modules[moduleName];

      invariant(
        module,
        `gentx-store error ~ <${storeName}>'s module <${moduleName}> is not defined!`
      );

      module.commit(arr[1], payload, location);

      // let observer know
      this.notify();

      return;
    }

    // mutation
    invariant(
      this._transactions[tsName],
      `gentx-store error ~ <${storeName}>'s transaction or module <${tsName}> is not defined!`
    )

    let tsFunc = this._transactions[tsName].bind(this);
    tsFunc(payload, this._state, this);

    // let observer know
    this.notify();
  }

  notify() {
    let curState = this.getState();
    let observers = this._observers;
    observers.forEach(observer => {
      observer.observer.next(curState);
    });
  }

  // store is also a observer
  next({name, data}) {
    this.commit(name, data);
  }

  error(error) {
    let storeName = this.name;
    console.log(`gentx-store error ~ <${storeName}> receive unexpect error:`);
    console.log(error);
  }

  complete() {
    //
  }
}
