/* eslint no-shadow: ["error", { "allow": ["state", "getters"] }] */
import Vue from 'vue'; // eslint-disable-line import/no-extraneous-dependencies

import { nanoid } from 'nanoid/non-secure';

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
    commit('setAssets', response.return);
  },
  addAsset({ commit }, asset) {
    // Get new scenario id from server
    // asset.id = this.$axios.$post('/api/v1/a');

    asset.id = nanoid();
    commit('newAsset', { asset });
  },
  removeAsset({ commit }, id) {
    commit('deleteAsset', { id });
    // FIXME: use id to delete assets
    this.$axios.$delete(`/api/v1/a/${id}`);
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
