/* Copyright (C) 2021 The Plea Justice Project
 *
 * Please see https://pleajustice.org for information about this project's
 * licensing and how you can make a contribution.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';

export const EventBus = new Vue();

export class Event {
  // Simple event
  static collapseAll(collapse) {
    EventBus.$emit('collapseAll', collapse);
  }
}

export class EventListener {
  // Simple event listener with callback
  static collapseAll(callbackFunction) {
    EventBus.$on('collapseAll', callbackFunction);
  }
}
