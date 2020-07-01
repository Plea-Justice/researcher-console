/* eslint no-shadow: ["error", { "allow": ["state"] }] */
import Vue from 'vue'; // eslint-disable-line import/no-extraneous-dependencies

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
    scenario.id = nanoid();
    commit('newScenario', { scenario });
    this.$axios.$post('/api/v1/s');
  },
  removeScenario({ commit }, id) {
    commit('deleteScenario', { id });
    this.$axios.$delete(`/api/v1/s/${id}`);
  },
  duplicateScenario({ commit }, id) {
    commit('copyScenario', { copyId: id, newId: nanoid() });
    this.$axios.$post('/api/v1/s');
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
