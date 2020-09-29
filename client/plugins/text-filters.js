import Vue from 'vue'; // eslint-disable-line import/no-extraneous-dependencies

Vue.filter('capitalize', function(value) {
  if (!value) return '';
  value = value.toString();
  return value.charAt(0).toUpperCase() + value.slice(1);
});

Vue.filter('timeToNow', function(value) {
  if (!value) return '';

  const date = new Date(value);

  let time = Date.now() - date;

  time *= 1 / 1000;
  if (time <= 60) return `seconds ago`;

  time *= 1 / 60;
  if (time <= 60) return `${parseInt(time)} ${time < 2 ? 'minute' : 'minutes'} ago`;

  time *= 1 / 60;
  if (time <= 24) return `${parseInt(time)} ${time < 2 ? 'hour' : 'hours'} ago`;

  return date.toLocaleString();
});
