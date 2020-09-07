<template>
  <b-select v-bind="$attrs" v-model="innerValue" :icon="icon">
    <option :value="null">None</option>
    <!-- If value does not exists insert dummy value -->
    <option v-if="invalidOldFile" :value="value">{{ value.name }}</option>
    <option
      v-for="file in options"
      :key="file.id"
      :value="{ id: file.id, name: file.name }"
    >{{ file.name }}</option>
  </b-select>
</template>

<script>
export default {
  props: {
    value: {
      required: true
    },
    // options is false to allow data to load
    // Object of form { id: {...asset} }
    options: Object,
    icon: String
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
      console.log(
        !!this.value && (!this.options || !this.options?.[this.value.id])
      );
      return !!this.value && (!this.options || !this.options?.[this.value.id]);
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
