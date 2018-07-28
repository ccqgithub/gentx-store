'use strict';

function invariant(condition, message) {
  if (condition) return;
  throw new Error(message);
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var GentStore = function () {

  // constructor
  function GentStore() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, GentStore);

    this._check(options);

    this._isGentStore = true;
    this.debug = !!options.debug;
    this.name = options.name || 'GentStore';
    this._state = options.initialState || {};
    this._transactions = options.transactions || {};
    this._modules = options.modules || {};
    this._snapshot = options.snapshot || function (data) {
      return JSON.parse(JSON.stringify(data));
    };
    this._observers = [];
  }

  createClass(GentStore, [{
    key: '_check',
    value: function _check(options) {
      var sotreName = this.name;

      invariant((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object', 'gentx-store error ~ <' + sotreName + '>\'s options must be an object!');

      var initialState = options.initialState;
      invariant(!initialState || (typeof initialState === 'undefined' ? 'undefined' : _typeof(initialState)) === 'object', 'gentx-store error ~ <' + sotreName + '>\'s options.initialState must be an object!');

      var transactions = options.transactions;
      invariant(!transactions || (typeof transactions === 'undefined' ? 'undefined' : _typeof(transactions)) === 'object', 'gentx-store error ~ <' + sotreName + '>\'s options.transactions must be an object!');

      var snapshot = options.snapshot;
      invariant(!snapshot || typeof snapshot === 'function', 'gentx-store error ~ <' + sotreName + '>\'s options.snapshot must be an function!');

      var modules = options.modules || {};
      invariant(modules && (typeof modules === 'undefined' ? 'undefined' : _typeof(modules)) === 'object', 'gentx-store error ~ <' + sotreName + '>\'s options.modules is must be object!');

      Object.keys(modules).forEach(function (key) {
        var module = modules[key];
        invariant((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module._isGentStore, 'gentx-store error ~ <' + sotreName + '>\'s module <' + key + '> must be a store instance!');
      });
    }

    // subscribe

  }, {
    key: 'subscribe',
    value: function subscribe(observer) {
      var observers = this._observers;
      if (typeof observer === 'function') {
        observer = { next: observer };
      }
      observers.push({
        observer: observer
      });

      return {
        unsubscribe: function unsubscribe() {
          var i = observers.indexOf(observer);
          observers.splice(i, 1);
        }
      };
    }

    // get store's state

  }, {
    key: 'getState',
    value: function getState() {
      var _this = this;

      var state = this._state;

      Object.keys(this._modules).forEach(function (moduleName) {
        state[moduleName] = _this._modules[moduleName].getState();
      });

      return state;
    }

    /**
     * Get child module
     * @param {String} mName 
     */

  }, {
    key: 'getChildModule',
    value: function getChildModule(mName) {
      return this._modules[mName];
    }

    /**
     * clone a node in state, internal use: `options.snapshot` or `JSON.parse(JSON.stringify(node))`
     * let userList = store.copy('user.list');
     */

  }, {
    key: 'copy',
    value: function copy(path) {
      var arr = path ? path.split('.') : [];
      var find = this.state;

      while ((typeof find === 'undefined' ? 'undefined' : _typeof(find)) === 'object' && arr.length) {
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

  }, {
    key: 'commit',
    value: function commit(tsName, payload) {
      var parent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

      var arr = tsName.split('.', 2);
      var location = parent ? parent + '.' + arr[0] : arr[0];
      var storeName = this.name;

      // log
      if (this.debug && !parent) {
        console.log('gentx-store log ~ <' + storeName + '> commit <' + tsName + '>', this._snapshot(payload));
      }

      // module
      if (arr.length > 1) {
        var moduleName = arr[0];
        var module = this._modules[moduleName];

        invariant(module, 'gentx-store error ~ <' + storeName + '>\'s module <' + moduleName + '> is not defined!');

        module.commit(arr[1], payload, location);

        // let observer know
        this.notify();

        return;
      }

      // mutation
      invariant(this._transactions[tsName], 'gentx-store error ~ <' + storeName + '>\'s transaction or module <' + tsName + '> is not defined!');

      var tsFunc = this._transactions[tsName].bind(this);
      tsFunc(payload, this._state, this);

      // let observer know
      this.notify();
    }
  }, {
    key: 'notify',
    value: function notify() {
      var curState = this.getState();
      var observers = this._observers;
      observers.forEach(function (observer) {
        observer.observer.next(curState);
      });
    }

    // store is also a observer

  }, {
    key: 'next',
    value: function next(_ref) {
      var name = _ref.name,
          data = _ref.data;

      this.commit(name, data);
    }
  }, {
    key: 'error',
    value: function error(_error) {
      var storeName = this.name;
      console.log('gentx-store error ~ <' + storeName + '> receive unexpect error:');
      console.log(_error);
    }
  }, {
    key: 'complete',
    value: function complete() {
      //
    }
  }]);
  return GentStore;
}();

module.exports = GentStore;
//# sourceMappingURL=gentx-store.common.js.map
