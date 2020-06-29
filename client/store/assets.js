import Vue from 'vue'; // eslint-disable-line import/no-extraneous-dependencies

// FIXME: fix nanoid warning
import { nanoid } from 'nanoid/non-secure';

export const state = () => ({
  assets: {},
  assetList: []
});

export const getters = {
  assetSet: state => state.assetList.map(id => state.assets[id])
};

export const actions = {
  async getAssets({ commit }) {
    const response = await this.$axios.$get('/api/v1/a');
    commit('setAssets', response.return);
  },
  addAsset({ commit }, asset) {
    asset.id = nanoid();
    commit('newAsset', { asset });
    this.$axios.$post('/api/v1/a');
  },
  removeAsset({ commit }, id) {
    commit('deleteAsset', { id });
    // this.$axios.$delete(`/api/v1/a/${state.assets[id].name}`);
  }
};

export const mutations = {
  setAssets(state, res) {
    state.assets = res.assets;
    state.assetList = res.assetList;
  },
  newAsset(state, payload) {
    // Add new asset to state
    // FIXME: add asset
    Vue.set(state.assets, payload.asset.id, payload.asset);
    state.assetList.unshift(payload.asset.id);
  },
  deleteAsset(state, payload) {
    // Remove asset
    state.assetList.splice(state.assetList.indexOf(payload.id), 1);
    Vue.delete(state.assets, payload.id);

    this.$axios.$delete(`/api/v1/a/${state.assets[payload.id].name}`);
  }
};
