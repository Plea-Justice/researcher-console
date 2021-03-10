/* Copyright (C) 2021 The Plea Justice Project
 *
 * Please see https://pleajustice.org for information about this project's
 * licensing and how you can make a contribution.
 */

import Vue from 'vue'; // eslint-disable-line import/no-extraneous-dependencies

Vue.filter('capitalize', function(value) {
  if (!value) return '';
  return (
    value
      .toString()
      .charAt(0)
      .toUpperCase() + value.slice(1)
  );
});

Vue.filter('timeToNow', function(value) {
  // FIXME: This doesn't account for leap years, "over" a certain period, etc.
  // it's prob just easier to use the lightweight dayjs lib

  if (!value) return '';

  const date = new Date(value);

  let time = Date.now() - date;

  time /= 1000;
  if (time <= 60) return `just now`;

  time /= 60;
  if (time <= 60) return `${Math.trunc(time)} ${time < 2 ? 'minute' : 'minutes'} ago`;

  time /= 60;
  if (time <= 24) return `${Math.trunc(time)} ${time < 2 ? 'hour' : 'hours'} ago`;

  const days = Math.trunc(time / 24);
  if (days <= 7) return `${days} ${days < 2 ? 'day' : 'days'} ago`;

  time /= 7;
  if (time <= 4) return `${Math.trunc(time)} ${time < 2 ? 'week' : 'weeks'} ago`;

  return date.toLocaleString().split(',')[0];
});
