<template>
  <!-- ValidationProvider is only used here to sync validate event, passed state -->
  <ValidationProvider
    :vid="vid"
    :name="$attrs.name || $attrs.label"
    :rules="rules"
    v-slot="{ passed }"
  >
    <b-field
      v-bind="$attrs"
      :type="{ 'is-danger': error.status, 'is-success': passed && !error.status }"
      :message="error.message"
    >
      <b-taginput
        v-model="innerValue"
        @blur="onBlur()"
        ref="tagInput"
        :before-adding="validateTagInput"
        attached
        placeholder="Name Buttons"
        allow-duplicates
      />
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
  data() {
    const StatusObj = {
      status: false,
      message: ""
    };

    return {
      StatusObj,
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
