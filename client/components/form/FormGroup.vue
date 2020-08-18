<template>
  <b-field
    v-bind="$attrs"
    :label="`${label}`"
    :custom-class="customClass"
    :type="$attrs.type || type"
    :message="$attrs.message || firstErrorMessage"
  >
    <slot />
  </b-field>
</template>
<script>
import { singleErrorExtractorMixin } from "vuelidate-error-extractor";
export default {
  extends: singleErrorExtractorMixin,
  computed: {
    type() {
      return this.hasErrors ? "is-danger" : this.isValid ? "is-success" : null;
    },
    customClass() {
      return this.hasErrors
        ? "has-text-danger"
        : this.isValid
        ? "has-text-success"
        : null;
    }
  }
};
</script>
