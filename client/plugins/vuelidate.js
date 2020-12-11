// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';
import vuelidate from 'vuelidate';
import vuelidateErrorExtractor, { templates } from 'vuelidate-error-extractor';

import customFormGroup from '~/components/form/FormGroup';

Vue.use(vuelidate);
Vue.use(vuelidateErrorExtractor, {
  /**
   * Optionally provide the template in the configuration.
   * or register like so Vue.component("FormField", templates.singleErrorExtractor.foundation6)
   */
  template: customFormGroup, // you can also pass your own custom template
  // error messages to use
  messages: {
    required: '"{attribute}" is a required field',
    alphaNum: 'Only letters and numbers allowed',
    alphaNumSpace: 'Only letters and numbers allowed.',
    alphaNumExtended: 'Only letters, numbers, or _-+()$. allowed.',
    maxLength: 'Exceeds the max length',
    url: "Must be of a proper url format, e.g. 'www.pleajustice.org'"
  }
});
