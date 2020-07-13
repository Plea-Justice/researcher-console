import Vue from 'vue'; // eslint-disable-line import/no-extraneous-dependencies

Vue.filter('capitalize', function(value) {
  if (!value) return '';
  value = value.toString();
  return value.charAt(0).toUpperCase() + value.slice(1);
});
