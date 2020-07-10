<template>
  <BSelectWithValidation
    v-model="innerValue"
    :rules="invalidOldFile ? `excluded:${value}` : null"
    :immediate="invalidOldFile"
    :label="label"
    :type="error.flag ? 'is-danger' : null"
    :message="error.flag ? error.message : null"
  >
    <!-- FIXME: warning for empty selector, selector with no options? -->
    <option value="None">None</option>
    <!-- If value does not exists insert dummy value and flag error -->
    <option v-if="error.flag" :value="value">{{ value }}</option>
    <option v-for="file in options" :key="file" :value="file">{{
      file
    }}</option>
  </BSelectWithValidation>
</template>

<script>
import BSelectWithValidation from "~/components/inputs/BSelectWithValidation";

export default {
  components: { BSelectWithValidation },
  props: {
    value: {
      required: true
    },
    options: {
      type: Array,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: false
    }
  },
  data: () => ({
    innerValue: ""
  }),
  // FIXME: Update these to computed options
  // FIXME: extrapolate commmon to shared component or mixin
  watch: {
    // Handles internal model changes.
    innerValue(newVal) {
      this.$emit("input", newVal);
    },
    // Handles external model changes.
    value(newVal) {
      this.innerValue = newVal;
    }
  },
  created() {
    if (this.value) {
      this.innerValue = this.value;
    }
  },
  computed: {
    invalidOldFile() {
      return this.value &&
        this.value !== "None" &&
        !this.options.includes(this.value)
        ? true
        : false;
    },
    error() {
      let isError = true;
      let message = null;

      if (this.options.length === 0) {
        message = `No files for "${this.label}" exists`;
      } else if (this.invalidOldFile) {
        message = `File "${this.value}" does not exist`;
      } else {
        isError = false;
      }

      return {
        flag: isError,
        message: message
      };
    }
  }
};
</script>
