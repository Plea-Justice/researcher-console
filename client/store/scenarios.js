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
      const { id } = response.result;
      commit('newScenario', { ...scenario, id, modified: null, created: Date.now() });
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
        (count, scenario) => (scenario.name.startsWith(copyName) ? count + 1 : count),
        0
      );

      if (duplicateCount > 0) copyName += ` ${duplicateCount + 1}`;

      const newResponse = await this.$axios.$post('/api/v1/scenarios', {
        ...response.result,
        meta: { name: copyName }
      });
      if (newResponse.success) commit('copyScenario', { name: copyName, copyId: id, newId: newResponse.result.id });
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
    const copiedScenario = Object.assign({}, state.scenarios[payload.copyId]);
    copiedScenario.id = payload.newId;
    copiedScenario.name = payload.name;

    Vue.set(state.scenarios, payload.newId, copiedScenario);
    state.scenarioList.splice(state.scenarioList.indexOf(payload.copyId) + 1, 0, payload.newId);
  }
};
