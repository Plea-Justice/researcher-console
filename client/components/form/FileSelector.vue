<template>
  <form-group :label="label" :validator="validator">
    <!-- :rules="invalidOldFile ? `excluded:${value}` : null" -->
    <b-select v-bind="$attrs" v-model="innerValue" :icon="icon">
      <option :value="null">None</option>
      <!-- If value does not exists insert dummy value -->
      <option v-if="invalidOldFile" :value="value">{{ value }}</option>
      <option v-for="file in options" :key="file" :value="file">{{ file }}</option>
    </b-select>
  </form-group>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: false
    },
    // This is false to allow data to load
    options: {
      type: Array,
      required: false
    },
    validator: {
      required: true
    },
    value: {
      required: true
    },
    icon: {
      type: String,
      required: false
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
    },
    invalidOldFile() {
      return this.value && this.options && !this.options.includes(this.value);
    },
    status() {
      let flag = true;
      let type = "";
      let message = null;

      // Errors
      if (this.invalidOldFile) {
        type = "is-danger";
        message = `File "${this.value}" does not exist`;
      }
      // Warnings
      else if (this.options && this.options.length === 0) {
        type = "is-warning";
        message = `No files for "${this.label}" exists`;
      } else {
        flag = false;
      }

      return { flag, type, message };
    }
  }
};
</script>
