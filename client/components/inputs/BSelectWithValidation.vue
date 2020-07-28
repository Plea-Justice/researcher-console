<template>
  <ValidationProvider
    :vid="vid"
    :name="$attrs.name || $attrs.label"
    :rules="rules"
    :immediate="immediate"
    v-slot="{ errors, passed }"
  >
    <b-field
      v-bind="$attrs"
      :type="(status && status.type) || { 'is-danger': errors[0], 'is-success': passed }"
      :message="status ? [status.message, ...errors] : errors"
    >
      <b-select v-model="innerValue" v-bind="$attrs">
        <slot />
      </b-select>
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
      type: String,
      required: false
    },
    rules: {
      type: [Object, String],
      required: false,
      default: ""
    },
    immediate: {
      type: Boolean,
      required: false,
      default: false
    },
    status: {
      type: Object,
      required: false
    },
    // must be included in props
    value: {
      type: null,
      required: true
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
  }
};
</script>
