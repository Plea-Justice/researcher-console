/* eslint no-shadow: ["error", { "allow": ["state", "getters"] }] */
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';

export const state = () => ({
  assets: {},
  assetList: [],
  allAssetTypes: []
});

export const getters = {
  assets: state => state.assets,
  assetSet: state => state.assetList.map(id => state.assets[id]),
  allAssetTypes: state => state.allAssetTypes
};

export const actions = {
  async getAssets({ commit }) {
    const response = await this.$axios.$get('/api/v1/assets');
    if (response.success) commit('setAssets', response.result);
  },
  async addAsset({ commit }, asset) {
    const formData = new FormData();
    Object.entries(asset).forEach(([key, value]) => formData.append(key, value));

    const response = await this.$axios.$post('/api/v1/assets', formData);
    if (response.success) {
      delete asset.file;
      commit('newAsset', { asset: response.result });
    }
  },
  async duplicateAsset({ commit }, id) {
    const response = await this.$axios.$post(`/api/v1/assets/${id}`);

    if (response.success) commit('newAsset', { asset: response.result });
  },
  async removeAsset({ commit }, id) {
    const response = await this.$axios.$delete(`/api/v1/assets/${id}`);
    if (response.success) commit('deleteAsset', { id });
  },
  async editAsset({ commit }, asset) {
    const response = await this.$axios.$put(`/api/v1/assets/${asset.id}`, asset);
    if (response.success) commit('updateAsset', asset);
  }
};

// FIXME: sorting should be handled better
// set Assets could probably be simplified
export const mutations = {
  setAssets(state, res) {
    state.assets = res.assets;
    state.assetList = res.assetList;
    state.allAssetTypes = res.assetTypes.sort();
  },
  newAsset(state, { asset }) {
    // Add new asset to state

    // TODO: Order assets?
    Vue.set(state.assets, asset.id, asset);
    state.assetList.unshift(asset.id);
  },
  deleteAsset(state, { id }) {
    // Remove asset
    state.assetList.splice(state.assetList.indexOf(id), 1);
    Vue.delete(state.assets, id);
  },
  updateAsset(state, asset) {
    Vue.set(state.assets, asset.id, asset);
  }
};
