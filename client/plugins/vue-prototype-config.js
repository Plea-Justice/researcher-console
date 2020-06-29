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
