/* Copyright (C) 2021 The Plea Justice Project
 *
 * Please see https://pleajustice.org for information about this project's
 * licensing and how you can make a contribution.
 */

export default {
  data() {
    const ButtonStatus = {
      NORMAL: 0,
      ERROR: 1,
      SUCCESS: 2
    };

    return {
      ButtonStatus
    };
  }
};

export class ButtonState {
  constructor(ButtonStatus) {
    this.ButtonStatus = ButtonStatus;
    this.loading = false;
    this.status = ButtonStatus.NORMAL;
  }

  type(baseType = '') {
    let type = baseType;
    if (this.status === this.ButtonStatus.ERROR) type = 'is-danger';
    else if (this.status === this.ButtonStatus.SUCCESS) type = 'is-success';
    return type;
  }

  icon(baseIcon = '') {
    let icon = baseIcon;
    if (this.status === this.ButtonStatus.ERROR) icon = 'times';
    else if (this.status === this.ButtonStatus.SUCCESS) icon = 'check';
    return icon;
  }

  setTempStatus(status, duration = 2000) {
    if (this.loading) this.loading = false;
    this.status = status;

    setTimeout(() => {
      this.status = this.ButtonStatus.NORMAL;
    }, duration);
  }
}
