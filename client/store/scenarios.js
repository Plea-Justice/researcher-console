import Vue from 'vue'; // eslint-disable-line import/no-extraneous-dependencies

// FIXME: fix nanoid warning
import { nanoid } from 'nanoid/non-secure';

export const state = () => ({
  scenarios: {},
  scenarioList: []
});

// TODO: fix condition Lengths
export const getters = {
  scenarioSet: state => state.scenarioList.map(scenarioId => state.scenarios[scenarioId]),
};

export const actions = {
  async getScenarios({ commit }) {
    const response = await this.$axios.$get(
      "api/v1/s"
    );

    commit('setScenarios', response.return);
  },
  addScenario({ commit }, scenario) {
    scenario.id = nanoid();
    commit('newScenario', { scenario });
  },
  removeScenario({ commit }, id) {
    commit('deleteScenario', { id });
  }
};

export const mutations = {
  setScenarios(state, scenarios) {

    scenarios.forEach(scenario => {
      // Add each scenario to state
      Vue.set(state.scenarios, scenario.id, scenario)
      state.scenarioList.push(scenario.id)
    })
  },
  newScenario(state, payload) {
    // Add new scenario to state
    Vue.set(state.scenarios, payload.scenario.id, payload.scenario);
    state.scenarioList.unshift(payload.scenario.id);
  },
  deleteScenario(state, payload) {
    // Remove scenario
    state.scenarioList.splice(state.scenarioList.indexOf(payload.id), 1)
    Vue.delete(state.scenarios, payload.id)
  }
};

