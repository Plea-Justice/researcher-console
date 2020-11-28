export default {
  data() {
    const ButtonStatus = {
      NORMAL: 0,
      ERROR: 1,
      SUCCESS: 2
    };

    class ButtonState {
      constructor() {
        this.loading = false;
        this.status = ButtonStatus.NORMAL;
      }

      type(baseType = '') {
        let type = baseType;
        if (this.status === ButtonStatus.ERROR) type = 'is-danger';
        else if (this.status === ButtonStatus.SUCCESS) type = 'is-success';
        return type;
      }

      icon(baseIcon = '') {
        let icon = baseIcon;
        if (this.status === ButtonStatus.ERROR) icon = 'times';
        else if (this.status === ButtonStatus.SUCCESS) icon = 'check';
        return icon;
      }

      setTempStatus(status, duration = 2000) {
        if (this.loading) this.loading = false;
        this.status = status;

        setTimeout(() => {
          this.status = ButtonStatus.NORMAL;
        }, duration);
      }
    }

    return {
      ButtonState,
      ButtonStatus
    };
  }
};
