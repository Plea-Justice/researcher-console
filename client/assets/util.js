// Define empty function
export function noop() {}

export const toPascalCase = text =>
  text.length
    ? text
        .split(' ')
        .map(word => word[0].toUpperCase() + word.substring(1).toLowerCase())
        .join(' ')
    : text;

// Stripped down throttle function from underscore.js
export function throttle(func, wait, options) {
  let context;
  let args;
  let result;
  let timeout = null;
  let previous = 0;
  if (!options) options = {};
  const later = function() {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function() {
    const now = Date.now();
    if (!previous && options.leading === false) previous = now;
    const remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
}

// Simple debounce function from underscore.js
export function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

export function posixTimeToHoursAgo(posixTime) {
  const date = new Date(posixTime);

  let time = Date.now() - date;

  time *= 1 / 1000;
  if (time <= 60) return `seconds ago`;

  time *= 1 / 60;
  if (time <= 60) return `${parseInt(time)} ${time < 2 ? 'minute' : 'minutes'} ago`;

  time *= 1 / 60;
  if (time <= 24) return `${parseInt(time)} ${time < 2 ? 'hour' : 'hours'} ago`;

  return date.toLocaleString();
}
