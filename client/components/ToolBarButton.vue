<template>
  <b-button
    @click="onClick()"
    v-bind="$attrs"
    :type="$attrs.type || EnabledBtnType"
    :disabled="$attrs.disabled || isDisabled"
  >
    <slot name="default" />
  </b-button>
</template>

<script>
export default {
  props: {
    mode: {
      type: [Number, Boolean],
      required: false,
      default: true
    },
    value: {
      type: [Number, Boolean],
      required: false,
      default: undefined
    }
  },
  data() {
    return {
      defaultMode: this.value
    };
  },
  computed: {
    innerValue: {
      get: function() {
        return this.value;
      },
      set: function(newVal) {
        this.$emit("input", newVal);
      }
    },
    isToggle() {
      return this.innerValue !== undefined;
    },
    isOn() {
      return this.isToggle && this.innerValue === this.mode;
    },
    isOff() {
      return (
        this.isToggle && !this.isOn && this.innerValue === this.defaultMode
      );
    },
    isDisabled() {
      return this.isToggle && !this.isOn && !this.isOff;
    },
    EnabledBtnType() {
      return this.isToggle && this.isOn ? "is-success" : "";
    }
  },
  methods: {
    onClick() {
      if (this.isToggle) {
        this.toggleModes();
        if (this.isOn) {
          this.$emit("click", false);
        } else if (this.isOff) {
          this.$emit("click", true);
        }
      } else {
        this.$emit("click");
      }
    },
    toggleModes() {
      this.innerValue = this.isOff ? this.mode : this.defaultMode;
    }
  }
};
</script>
