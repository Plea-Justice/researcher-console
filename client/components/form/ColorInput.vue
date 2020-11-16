<template>
  <b-field
    :type="status"
    :label="message"
    custom-class="is-size-7 has-text-weight-light"
  >
    <p class="control">
      <b-button
        :style="computedColor"
        :type="`is-static ${status}`"
        :size="size"
        class="color-preview"
        outlined
      />
    </p>

    <b-input
      ref="input"
      v-bind="$attrs"
      :value="value"
      @input="input($event)"
      @keydown.native="holdPrefix($event)"
      @focus="prefixHex()"
      @blur="unprefixHex()"
      :size="size"
      :has-counter="false"
      maxlength="7"
    />
  </b-field>
</template>

<script>
// Import Vuelidate Rules
import { maxLength } from "vuelidate/lib/validators";
import { helpers } from "vuelidate/lib/validators";

export default {
  props: {
    value: {
      required: true,
      type: null
    },
    size: String,
    message: String
  },
  data() {
    return {
      showPrefix: false
    };
  },
  validations() {
    const validLengths = options => value =>
      !helpers.req(value) || options.includes(value.length);

    const hexColor = helpers.regex("hexColor", /^#[\da-f]*$/);

    return {
      innerValue: {
        // Valid length includes '#'
        validLengths: validLengths([4, 7]),
        hexColor
      }
    };
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
    computedColor() {
      return this.value && !this.$v.innerValue.$invalid
        ? `background-color: ${this.value}`
        : undefined;
    },
    status() {
      if (this.value.length > 1)
        return !this.$v.$invalid ? "is-success" : "is-danger";
      else return undefined;
    }
  },
  methods: {
    input(newVal) {
      if (newVal.length > 0) this.$emit("input", newVal.toLowerCase().trim());
    },
    holdPrefix(e) {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        this.value.length == 1
      )
        e.preventDefault();
    },
    prefixHex() {
      if (!this.value.length) {
        this.$emit("input", "#");
        this.$nextTick(() => {
          this.$refs.input.$el.firstChild.setSelectionRange(1, 1);
        });
      }
    },
    unprefixHex() {
      if (this.value.length === 1) this.$emit("input", "");
    }
  }
};
</script>

<style lang="scss" scoped>
.color-preview.is-success {
  border-color: $border;
}
</style>
