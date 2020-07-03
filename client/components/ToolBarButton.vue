<template>
  <b-button
    @click="onClick()"
    :type="EnabledBtnType(Modes.COPY)"
    :disabled="isDisabledMode(Modes.COPY)"
  >
    <slot name="default" />
  </b-button>
</template>

<script>
export default {
  props: {
    mode: {
      type: Number,
      required: false
    },
    value: {
      type: Number,
      required: false
    }
  },
  data: {
    defaultMode: this.value
  },
  computed: {
    isToggle() {
      return this.mode !== undefined && this.value !== undefined;
    }
  },
  methods: {
    onClick() {
      if (this.isToggle) this.toggleModes();
      this.$emit("click");
    },
    isDisabledMode() {
      return this.value !== this.defaultMode && this.value !== undefined
        ? this.value !== this.mode
        : true;
    },
    EnabledBtnType() {
      return this.isToggle && this.value === this.mode ? "is-success" : "";
    },
    toggleModes() {
      this.value =
        this.value === this.defaultMode ? this.mode : this.defaultMode;
    }
  }
};
</script>

<style>
</style>
