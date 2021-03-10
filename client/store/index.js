/* Copyright (C) 2021 The Plea Justice Project
 *
 * Please see https://pleajustice.org for information about this project's
 * licensing and how you can make a contribution.
 */

/* eslint no-shadow: ["error", { "allow": ["state"] }] */
export const state = () => ({
  counter: 0
});

export const mutations = {
  increment(state) {
    state.counter += 1;
  }
};
