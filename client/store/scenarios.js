/* eslint no-shadow: ["error", { "allow": ["state", "getters"] }] */
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';

export const state = () => ({
  scenarios: {},
  scenarioList: []
});

export const getters = {
  scenarioSet: state => state.scenarioList.map(scenarioId => state.scenarios[scenarioId])
};

export const actions = {
  async getScenarios({ commit }) {
    const response = await this.$axios.$get('/api/v1/scenarios');
    if (response.success) commit('setScenarios', response.result);
  },
  async addScenario({ commit }, scenario) {
    // Get new scenario id from server
    const response = await this.$axios.$post('/api/v1/scenarios', { meta: scenario });
    if (response.success) {
      commit('newScenario', response.result);
    }
  },
  async removeScenario({ commit }, id) {
    const response = await this.$axios.$delete(`/api/v1/scenarios/${id}`);
    if (response.success) commit('deleteScenario', { id });
  },
  async editScenario({ commit }, scenario) {
    const modifiedScenario = { ...scenario, modified: Date.now() };

    const response = await this.$axios.$put(`/api/v1/scenarios/${scenario.id}`, {
      meta: modifiedScenario
    });
    if (response.success) commit('updateScenario', modifiedScenario);
  },
  async duplicateScenario({ commit, state, getters }, id) {
    // Fetch full scenario from server
    const response = await this.$axios.$post(`/api/v1/scenarios/${id}`);
    if (response.success) {
      commit('copyScenario', response.result);
    }
  }
};

export const mutations = {
  setScenarios(state, res) {
    state.scenarios = res.scenarios;
    state.scenarioList = res.scenarioList;
  },
  newScenario(state, scenario) {
    // Add new scenario to state
    Vue.set(state.scenarios, scenario.id, scenario);
    state.scenarioList.unshift(scenario.id);
  },
  deleteScenario(state, payload) {
    // Remove scenario
    state.scenarioList.splice(state.scenarioList.indexOf(payload.id), 1);
    Vue.delete(state.scenarios, payload.id);
  },
  updateScenario(state, payload) {
    Vue.set(state.scenarios, payload.id, payload);
  },
  copyScenario(state, payload) {
    const copiedScenario = Object.assign({}, payload);

    Vue.set(state.scenarios, payload.id, copiedScenario);
    state.scenarioList.push(payload.id);
  }
};
