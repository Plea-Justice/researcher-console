/* Copyright (C) 2021 The Plea Justice Project
 *
 * Please see https://pleajustice.org for information about this project's
 * licensing and how you can make a contribution.
 */

export default {
  computed: {
    user() {
      return this.$auth.user || { name: 'dev', sessions: 1 };
    }
  }
};
