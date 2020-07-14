// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate';
// eslint-disable-next-line camelcase
import { required, max, alpha_spaces, excluded } from 'vee-validate/dist/rules';

Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);

// FIXME: import these per bundle size
extend('required', required);
extend('alpha_spaces', alpha_spaces);
extend('max', max);
extend('excluded', {
  validate: excluded.validate,
  message: '{_value_} is invalid, it may no longer exist'
});
