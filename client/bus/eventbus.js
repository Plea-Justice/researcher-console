// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';

export const EventBus = new Vue();

export class Event {
  // Simple event
  static collapseAll() {
    EventBus.$emit('collapseAll');
  }

  static validate() {
    EventBus.$emit('validate');
  }
}

export class EventListener {
  // Simple event listener with callback
  static collapseAll(callbackFunction) {
    EventBus.$on('collapseAll', callbackFunction);
  }

  static validate(callbackFunction) {
    EventBus.$on('validate', callbackFunction);
  }
}
