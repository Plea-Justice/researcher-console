<template>
  <!-- TODO: use scoped slots? -->
  <b-field :type="error.flag ? 'is-danger' : null" :message="error.flag ? error.message : null">
    <b-select
      @input="$emit('input', selectedValue)"
      :placeholder="placeholder"
      v-model="selectedValue"
      :icon="icon"
    >
      <option v-if="error.flag" :value="selectedValue">{{ selectedValue }}</option>
      <option v-for="file in fileNames" :key="file" :value="file">{{ file }}</option>
    </b-select>
  </b-field>
</template>

<script>
export default {
  props: {
    value: {},
    fileNames: {
      type: Array,
      required: true
    },
    placeholder: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: false
    }
  },
  data() {
    const selectedValue = this.value;

    return { selectedValue };
  },
  computed: {
    error() {
      let isError = true;
      let message = null;

      if (this.fileNames.length === 0) {
        message = `No files for "${this.placeholder}" exists`;
      } else if (this.value && !this.fileNames.includes(this.value)) {
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
