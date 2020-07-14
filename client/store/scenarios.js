/* eslint no-shadow: ["error", { "allow": ["state"] }] */
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';

import { nanoid } from 'nanoid/non-secure';

export const state = () => ({
  scenarios: {},
  scenarioList: []
});

export const getters = {
  scenarioSet: state => state.scenarioList.map(scenarioId => state.scenarios[scenarioId])
};

export const actions = {
  async getScenarios({ commit }) {
    const response = await this.$axios.$get('api/v1/s');
    commit('setScenarios', response.return);
  },
  async addScenario({ commit }, scenario) {
    // Get new scenario id from server
    const response = await this.$axios.$post('/api/v1/s', scenario);

    scenario.id = response.return.id;
    commit('newScenario', { scenario });
  },
  removeScenario({ commit }, id) {
    commit('deleteScenario', { id });
    this.$axios.$delete(`/api/v1/s/${id}`);
  },
  async duplicateScenario({ commit }, id) {
    const copyResponse = await this.$axios.$get(`/api/v1/s/${id}`);

    const { meta, ...data } = state();
    const copyScenario = { ...meta, vuex_state: data, ...copyResponse.return };
    copyScenario.name += ' Copy';

    const newResponse = await this.$axios.$post('/api/v1/s', copyScenario);
    const newId = newResponse.return.id;

    commit('copyScenario', { copyId: id, newId });
  }
};

export const mutations = {
  setScenarios(state, res) {
    state.scenarios = res.scenarios;
    state.scenarioList = res.scenarioList;
  },
  newScenario(state, payload) {
    // Add new scenario to state
    Vue.set(state.scenarios, payload.scenario.id, payload.scenario);
    state.scenarioList.unshift(payload.scenario.id);
  },
  deleteScenario(state, payload) {
    // Remove scenario
    state.scenarioList.splice(state.scenarioList.indexOf(payload.id), 1);
    Vue.delete(state.scenarios, payload.id);
  },
  copyScenario(state, payload) {
    const copiedScenario = Object.assign({}, state.scenarios[payload.copyId]);
    copiedScenario.id = payload.newId;
    copiedScenario.name = `${copiedScenario.name} Copy`;

    Vue.set(state.scenarios, payload.newId, copiedScenario);
    state.scenarioList.splice(state.scenarioList.indexOf(payload.copyId) + 1, 0, payload.newId);
  }
};
