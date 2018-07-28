# gentx-store

> A simple and gent data store.

## 安装

```sh
npm install gentx-store -S
```

commonjs 版本
```js
const Store = require('gentx-store');
// or
import Store from 'gentx-store';
```

ES6未编译版本
```js
import Store from 'gentx-store/index';
```

## 使用

- `new Store(options)`: 实例化一个Store。

  ```js
  import Store from 'gentx-store';

  let store = new Store({ // options:
    // 开启调试模式后，每一次commit都会打印出来, 默认false
    debug: process.env.NODE_ENV !== 'production',

    // store 的名字，主要是方便调试
    name: 'storeName',

    // 初始化状态
    initialState: {
      loginUser: {
        username: 'season.chen'
      }
    },

    // 模块，key: value的形式
    // 每一个模块是一个Store实例
    modules: {
      user,
    },

    // 事务，每一个方法定义一个数据变更
    transactions: {
      // data: 传入数据
      // state: 当前store的数据对象，不包括子module
      setLoginUser(data, state) {
        state.loginUser = data;
      },
    },

    // 自定义快照函数，主要用于`copy`方法克隆对象，默认如下
    snapshot: function(data) {
      return JSON.parse(JSON.stringify(data));
    }
  })
  ```

- `store.commit(transactionName, data)`: 提交一个事务。

  - `transactionName`: 事务名字，对应于sotre 的`transactions`。 
  
    如果`transaction`包含`.`分隔符, 则表示此次事务是提交给子模块的，而不是本store的事务。

    分隔符`.`前面的表示子模块的名字，后面表示提交给子模块的事务的名字。
    
    如`store.commit('setLoginUser', {})`表示应用到本 `store` 的事务: `setLoginUser`。 
     
    而`store.commit('user.add', {})`表示应用模块: `user`的事务: `add`。

  - `data`: 提交给事务的数据。

- `store.subscribe(observer)`: 订阅变更。 

  订阅后，store的每次`commit`提交都会通知观察者`observer`。   

  `observer`: 一个具有`next`方法的对象，或者是一个函数。 返回一个具有`unsubscribe`的对象。

  ```js
  let subscription = store.subscribe((state) => {
    // the store's new state is `state`
    console.log(state.loginUser);
  });

  // 取消订阅
  subscription.unsubscribe();
  ```

- `store.getState()`: 获取store的状态。

- `store.copy(nodePath)`: 克隆`state`的一个节点, 克隆方法用`options.snapshot`。

  ```js
  let userList = store.copy('user.list');
  ```
- `store.getChildModule(name)`: 获取子模块

## 注意

事务中的`state`参数只包括store本身的state，而不包含子module的state。如果需要在事务中更改子module的状态，需要在这个事务中手动给子module提交一个事务。

见下面`setLoginUserAndAddCorn`:

```js
transactions: {
    // 设置登录用户
    setLoginUser(user, state) {
      state.loginUser = user;
    },
    // 设置登录用户并且添加玉米
    setLoginUserAndAddCorn({user, corn}, state) {
      state.loginUser = user;
      // 调用子模块的commit
      this.getChildModule('barn').commit('addCorn', corn);
    }
  }
```

## 和`RxJS`一起使用.

`observable.subscribe(store)`: sotre 也可以作为观察者来进行变更数据, 数据流传入的数据格式必须是`{name: '事务名称', data: '提交给事务的数据'}`。

  ```js
  let newUser = {
    //...
  }

  Rx.Observable.of({
    // 事务名称
    name: 'setLoginUser',
    // 数据
    data: newUser,
  }).subscribe(store);

  // equal to:
  Rx.Observable.of({
    // 事务名称
    name: 'setLoginUser',
    // 数据
    data: newUser,
  }).subscribe(({name, data}) => {
    store.commit(name, data);
  });
  ```
