/* eslint no-shadow: ["error", { "allow": ["state"] }] */
export const state = () => ({
  counter: 0
});

export const mutations = {
  increment(state) {
    state.counter += 1;
  }
};
