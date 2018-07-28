const fs = require('fs');
const path = require('path');
const store = require('../sotres/main-store').default;

const timeout = 5000;

describe(
  'GentStore Test',
  () => {
   
    beforeAll(async () => {
      //
    }, timeout);

    it('Get State', async () => {
      let state = store.getState();
      await expect(state)
        .toHaveProperty('loginUser', 'test'); 
    });

    it('Module State', async () => {
      let state = store.getState();
      await expect(state.barn.corns[0].id)
        .toEqual(1); 
    });

    it('Commit', async () => {
      store.commit('setLoginUser', null);
      let state = store.getState();
      await expect(state.loginUser)
        .toEqual(null); 
    });

    it('Child Transaction In Parent', async () => {
      let corn = {id: 2, value: 2};
      store.commit('setLoginUserAndAddCorn', {
        loginUser: 'test', 
        corn: corn
      });
      let state = store.getState();
      await expect(state.barn.corns)
        .toContain(corn); 
    });

    it('Child Transaction', async () => {
      let corn = {id: 2, value: 2};
      store.commit('barn.addCorn', corn);
      let state = store.getState();
      await expect(state.barn.corns)
        .toContain(corn); 
    });

    it('Get Child Module', async () => {
      let childStore = store.getChildModule('barn');
      let state = childStore.getState();
      await expect(state.type)
        .toEqual('fresh'); 
    });

    it('Subscribe', async () => {
      let count = 0;
      let subsA = store.subscribe(() => {
        count++;
      });
      let subsB = store.subscribe({
        next() {
          count++;
        }
      });

      let corn = {id: 2, value: 2};
      store.commit('barn.addCorn', corn);
      store.commit('setLoginUser', 'test');
      store.commit('setLoginUserAndAddCorn', {
        loginUser: 'test', 
        corn: corn
      });
      await expect(count)
        .toEqual(6); 
    });

    it('Unsubscribe', async () => {
      let count = 0;
      let subsA = store.subscribe(() => {
        count++;
      });
      let subsB = store.subscribe({
        next() {
          count++;
        }
      });

      let corn = {id: 2, value: 2};
      store.commit('barn.addCorn', corn);
      store.commit('setLoginUser', 'test');
      subsB.unsubscribe();
      store.commit('setLoginUserAndAddCorn', {
        loginUser: 'test', 
        corn: corn
      });
      await expect(count)
        .toEqual(5); 
    });
  },
  timeout
);