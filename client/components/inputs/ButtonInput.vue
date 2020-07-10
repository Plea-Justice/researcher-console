<template>
  <b-field v-bind="$attrs" :type="error ? 'is-danger': ''" :message="errorMessage">
    <b-taginput
      v-model="innerValue"
      :before-adding="validateTagInput"
      attached
      size="is-medium"
      icon="tag-plus"
      placeholder="Add Buttons"
      allow-duplicates
    />
  </b-field>
</template>

<script>
export default {
  props: {
    value: {
      required: true
    }
  },
  data() {
    return {
      error: false,
      errorMessage: ""
    };
  },
  computed: {
    innerValue: {
      get: function() {
        return Array.isArray(this.value) ? this.value : [];
      },
      set: function(newVal) {
        this.$emit("input", newVal);
      }
    }
  },
  methods: {
    raiseError(yourErrorMessage) {
      this.error = true;
      this.errorMessage = yourErrorMessage;
    },
    validateTagInput(tagName) {
      // FIXME: Set limit on character length
      let valid = false;

      if (tagName.includes(" ")) {
        this.raiseError("Whitespace not allowed");
      } else if (this.innerValue.includes(tagName)) {
        this.raiseError("Duplicates not allowed");
      } else valid = true;

      return valid;
    }
  }
};
</script>
