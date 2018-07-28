import Store from '../../dist/gentx-store.common';
import barn from './modules/barn-store';

const mainStore = new Store({
  name: 'mainStore',

  initialState: {
    loginUser: 'test'
  },

  modules: {
    barn
  },

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
});

export default mainStore;