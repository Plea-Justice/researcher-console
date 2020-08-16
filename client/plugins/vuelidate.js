// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';
import vuelidate from 'vuelidate';
import vuelidateErrorExtractor, { templates } from 'vuelidate-error-extractor';

import customFormGroup from '~/components/form/formGroup';

Vue.use(vuelidate);
Vue.use(vuelidateErrorExtractor, {
  /**
   * Optionally provide the template in the configuration.
   * or register like so Vue.component("FormField", templates.singleErrorExtractor.foundation6)
   */
  template: customFormGroup, // you can also pass your own custom template
  // error messages to use
  messages: {
    required: 'The {attribute} field is required',
    alphaNum: 'Only letters and numbers allowed',
    maxLength: 'Exceeds the max length'
  }
});
