<template>
  <ValidationProvider
    :vid="vid"
    :name="$attrs.name || $attrs.label"
    :rules="rules"
    v-slot="{ errors, passed }"
  >
    <b-field
      v-bind="$attrs"
      :type="{ 'is-danger': errors[0], 'is-success': passed }"
      :message="errors"
    >
      <b-input ref="focus_target" v-model="innerValue" v-bind="$attrs" />
    </b-field>
  </ValidationProvider>
</template>

<script>
import { ValidationProvider } from "vee-validate";

export default {
  components: {
    ValidationProvider
  },
  props: {
    vid: {
      type: String
    },
    rules: {
      type: [Object, String],
      default: ""
    },
    // must be included in props
    value: {
      type: null
    }
  },
  computed: {
    innerValue: {
      get: function() {
        return this.value;
      },
      set: function(newVal) {
        this.$emit("input", newVal);
      }
    }
  },
  methods: {
    // Method accessible by $refs from Parent to focus on element
    focus() {
      this.$refs.focus_target.focus();
    }
  }
};
</script>
