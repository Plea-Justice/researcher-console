<template>
  <b-field
    v-bind="$attrs"
    :label="label"
    :custom-class="status.label"
    :type="status.type"
    :message="$attrs.message || firstErrorMessage"
  >
    <slot :type="type" :maxlength="maxLength" />
  </b-field>
</template>
<script>
import { singleErrorExtractorMixin } from "vuelidate-error-extractor";
export default {
  extends: singleErrorExtractorMixin,
  mounted() {
    //this.$refs.field.newType;
  },
  computed: {
    status() {
      let status = {
        type: null,
        label: null
      };
      if (this.$attrs.type) {
        status = {
          type: this.$attrs.type,
          label: `has-text${this.$attrs.type.substring(
            this.$attrs.type.indexOf("-")
          )}`
        };
      } else if (this.hasErrors) {
        status = {
          type: "is-danger",
          label: "has-text-danger"
        };
      } else if (this.isValid) {
        status = {
          type: "is-success",
          label: "has-text-success"
        };
      }

      return status;
    },
    type() {
      return (
        this.$attrs.type ||
        (this.hasErrors ? "is-danger" : this.isValid ? "is-success" : null)
      );
    },
    customClass() {
      return this.hasErrors
        ? "has-text-danger"
        : this.isValid
        ? "has-text-success"
        : null;
    },
    maxLength() {
      return this.validator.$params.maxLength?.max;
    }
  }
};
</script>
