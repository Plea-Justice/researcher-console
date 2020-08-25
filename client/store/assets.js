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
      const name = asset.file.name.slice(0, asset.file.name.indexOf('.'));
      delete asset.file;
      commit('newAsset', { asset: { ...asset, id: response.result, name, created: Date.now() } });
    }
  },
  async removeAsset({ commit }, id) {
    const response = await this.$axios.$delete(`/api/v1/assets/${id}`);
    if (response.success) commit('deleteAsset', { id });
  }
};

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
  }
};
