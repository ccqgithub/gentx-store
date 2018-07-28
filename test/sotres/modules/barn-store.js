import Store from '../../../index';

const barnStore = new Store({
  name: 'barnStore',
  
  initialState: {
    // 类型
    type: 'fresh',
    // 玉米
    corns: [
      {
        id: 1,
        value: 'test'
      }
    ],
    // 土豆
    potatos: {

    }
  },

  transactions: {
    // 添加玉米
    addCorn(corn, state) {
      state.corns.push(corn);
    },
    // 删除玉米
    deleteCorn(id, state) {
      let i = -1;
      state.corns.forEach((item, index) => {
        if (item.id == id) i = index;
      });
      if (i != -1) state.corns.splice(i, 1);
    }
  }
});

export default barnStore;