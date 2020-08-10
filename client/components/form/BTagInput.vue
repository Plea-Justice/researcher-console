<template>
  <b-field
    :label="$attrs.label"
    :validator="validator"
    :type="{ 'is-danger': error.status, 'is-success': touched && !error.status }"
    :message="error.message"
  >
    <b-taginput
      v-model="innerValue"
      @blur="onBlur()"
      :before-adding="validateTagInput"
      placeholder="Name Buttons"
      attached
      allow-duplicates
    />
  </b-field>
</template>

<script>
export default {
  name: "BTagInput",
  props: {
    value: {
      required: true,
      type: null
    }
  },
  data() {
    const StatusObj = {
      status: false,
      message: ""
    };

    return {
      StatusObj,
      touched: false,
      error: Object.assign({}, StatusObj)
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
    //FIXME: make this more specific to when you leave a scene?
    onBlur() {
      if (!this.touched) this.touched = true;

      if (this.error.status) {
        setTimeout(
          () => (this.error = Object.assign({}, this.StatusObj)),
          8000
        );
      }
    },
    raiseError(message) {
      this.error.status = true;
      this.error.message = message;
    },
    validateTagInput(tagName) {
      if (!this.touched) this.touched = true;

      // FIXME: Set limit on character length
      let valid = false;

      if (tagName.includes(" ")) {
        // Trim takes care of leading or trailing whitespace
        this.raiseError("Must be one word");
      } else if (this.innerValue.includes(tagName)) {
        this.raiseError("Duplicates not allowed");
      } else {
        valid = true;

        // Reset error obj
        this.error = Object.assign({}, this.StatusObj);
      }

      return valid;
    }
  }
};
</script>
