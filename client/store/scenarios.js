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
      scenario.id = response.result.id;
      scenario.created = Date.now();
      commit('newScenario', { scenario });
    }
  },
  async removeScenario({ commit }, id) {
    const response = await this.$axios.$delete(`/api/v1/scenarios/${id}`);
    if (response.success) commit('deleteScenario', { id });
  },
  async editScenario({ commit }, scenario) {
    const response = await this.$axios.$put(`/api/v1/scenarios/${scenario.id}`, scenario);
    if (response.success) commit('updateScenario', scenario);
  },
  async duplicateScenario({ commit, state, getters }, id) {
    const response = await this.$axios.$get(`/api/v1/scenarios/${id}`);
    if (response.success) {
      const scenarioName = state.scenarios[id].name;

      // Prevent 'Copy' chaining on duplicates
      let copyName =
        scenarioName.substring(scenarioName.lastIndexOf(' ')) === 'Copy'
          ? scenarioName
          : `${state.scenarios[id].name} Copy`;

      // Add number to ' Copy #' if multiple copies exists
      const duplicateCount = getters.scenarioSet.reduce(
        (count, scenario) => (scenario.name === copyName ? count + 1 : count),
        0
      );

      if (duplicateCount > 0) copyName += ` ${duplicateCount}`;

      const newResponse = await this.$axios.$post('/api/v1/scenarios', {
        ...response.result,
        meta: { name: copyName }
      });

      commit('copyScenario', { name: copyName, copyId: id, newId: newResponse.result.id });
    }
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
  updateScenario(state, payload) {
    Vue.set(state.scenarios, payload.id, payload);
  },
  copyScenario(state, payload) {
    const copiedScenario = Object.assign({}, state.scenarios[payload.copyId]);
    copiedScenario.id = payload.newId;
    copiedScenario.name = payload.name;

    Vue.set(state.scenarios, payload.newId, copiedScenario);
    state.scenarioList.splice(state.scenarioList.indexOf(payload.copyId) + 1, 0, payload.newId);
  }
};
