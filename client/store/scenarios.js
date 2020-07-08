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
  addScenario({ commit }, scenario) {
    // Get new scenario id from server
    // scenario.id = this.$axios.$post('/api/v1/s');

    scenario.id = nanoid(); // Temp
    commit('newScenario', { scenario });
  },
  removeScenario({ commit }, id) {
    commit('deleteScenario', { id });
    this.$axios.$delete(`/api/v1/s/${id}`);
  },
  duplicateScenario({ commit }, id) {
    // Get new scenario id from server
    // const newId = this.$axios.$post('/api/v1/s');

    const newId = nanoid();
    commit('copyScenario', { copyId: id, newId });
  }
};

export const mutations = {
  setScenarios(state, scenarios) {
    scenarios.forEach(scenario => {
      // Add each scenario to state
      Vue.set(state.scenarios, scenario.id, scenario);
      state.scenarioList.push(scenario.id);
    });
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
