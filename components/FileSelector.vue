<template>
  <!-- TODO: use scoped slots? -->
  <b-field :type="error.flag ? 'is-danger' : null" :message="error.flag ? error.message : null">
    <b-select
      @input="$emit('input', selectedValue)"
      :placeholder="placeholderText"
      v-model="selectedValue"
      :icon="icon"
    >
      <option v-if="error.flag" :value="selectedValue">{{ selectedValue }}</option>
      <option v-else v-for="file in files" :key="file" :value="file">{{ file }}</option>
    </b-select>
  </b-field>
</template>

<script>
export default {
  props: {
    value: {},
    assetType: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      required: false
    },
    icon: {
      type: String,
      required: false
    },
    manifest: {
      type: Object,
      required: true
    }
  },
  data() {
    const selectedValue = this.value;

    return { selectedValue };
  },
  computed: {
    files() {
      return this.manifest[this.assetType + "s"];
    },
    placeholderText() {
      return this.placeholder ? this.placeholder : this.assetType;
    },
    error() {
      let isError = true;
      let message = null;

      if (this.files == undefined || this.files == []) {
        message = `No files for "${this.placeholderText}"`;
      } else if (this.value && !this.files.includes(this.value)) {
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
