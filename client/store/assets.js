/* eslint no-shadow: ["error", { "allow": ["state", "getters"] }] */
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';

export const state = () => ({
  assets: {},
  assetList: [],
  allAssetTypes: []
});

export const getters = {
  assetSet: state => state.assetList.map(id => state.assets[id]),
  // FIXME: is this getter deprecate?
  assetSetByType: (state, getters) =>
    getters.assetSet.reduce(
      (obj, item) => (obj[item.type] ? obj[item.type].push(item) : (obj[item.type] = [item]), obj),
      {}
    ),
  allAssetTypes: state => state.allAssetTypes
};

export const actions = {
  async getAssets({ commit }) {
    const response = await this.$axios.$get('/api/v1/a');
    if (response.success) commit('setAssets', response.result);
  },
  async addAsset({ commit }, asset) {
    const formData = new FormData();
    Object.entries(asset).forEach(([key, value]) => formData.append(key, value));

    const response = await this.$axios.$post('/api/v1/a', formData);
    if (response.success) {
      asset.id = response.result;
      // FIXME: Throw away file at this point? Frontend doesn't need to hold all files
      commit('newAsset', { asset });
    }
  },
  async removeAsset({ commit }, id) {
    const response = await this.$axios.$delete(`/api/v1/a/${id}`);
    if (response.success) commit('deleteAsset', { id });
  }
};

export const mutations = {
  setAssets(state, res) {
    state.assets = res.assets;
    state.assetList = res.assetList;
    state.allAssetTypes = res.assetTypes.sort();
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
  }
};
