import Vue from 'vue'; // eslint-disable-line import/no-extraneous-dependencies
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate';
import { required, alpha_spaces, excluded } from 'vee-validate/dist/rules';

Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);

// FIXME: import these per bundle size
extend('required', required);
extend('alpha_spaces', alpha_spaces);
extend('excluded', {
  validate: excluded.validate,
  message: '{_value_} is invalid, it may no longer exist'
});
