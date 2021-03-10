/* Copyright (C) 2021 The Plea Justice Project
 *
 * Please see https://pleajustice.org for information about this project's
 * licensing and how you can make a contribution.
 */

import Vue from 'vue'; // eslint-disable-line import/no-extraneous-dependencies
import siteConfig from '~/siteConfig';

siteConfig.install = function() {
  Object.defineProperty(Vue.prototype, '$siteConfig', {
    get() {
      return siteConfig;
    }
  });
};

Vue.use(siteConfig);
