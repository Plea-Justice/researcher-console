<template>
  <div>
    <h3>Buttons</h3>
    <hr />

    <!-- FIXME: doesn't emit? -->

    <div v-if="!showButtonInput">
      <b-button
        type="is-primary"
        icon-right="plus"
        @click="openButtonInput()"
      ></b-button>
      <p v-if="buttons.length == 0" class="button-side-text">No buttons</p>
    </div>

    <p v-if="error">Error: {{ errorMessage }}</p>

    <b-field grouped group-multiline>
      <b-tag
        v-if="showButtonInput"
        size="is-medium"
        close-type="is-danger"
        attached
        closable
        :aria-close-label="`Close new button name input`"
        @close="closeButtonInput()"
      >
        <form @submit.prevent="addButton()">
          <b-input
            v-model="newButtonName"
            ref="button_input"
            class="tag-input"
            type="is-info"
            aria-placeholder="test"
          />
        </form>
      </b-tag>

      <div
        v-for="(button, index) in buttons"
        :key="`${button}-button`"
        class="control"
      >
        <b-tag
          size="is-medium"
          close-type="is-danger"
          attached
          closable
          :aria-close-label="`Delete ${button} button`"
          @close="removeButton(button)"
        >
          <span
            class="rename-button"
            @click="renameButton(button, index)"
            aria-label="rename-button"
            >{{ button }}</span
          >
        </b-tag>
      </div>
    </b-field>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      required: true
    }
  },
  data() {
    const buttons = !this.value ? [] : this.value;

    const showButtonInput = false;
    const error = false;

    const errorMessage = "Error: unknown error";

    const newButtonName = "";

    return {
      buttons,
      showButtonInput,
      error,
      errorMessage,
      newButtonName
    };
  },
  methods: {
    raiseError(yourErrorMessage) {
      this.error = true;
      this.errorMessage = yourErrorMessage;
    },
    lowerError() {
      this.error = false;
      //TODO: make this a static variable in component
      this.errorMessage = "Error: unknown error";
    },
    openButtonInput() {
      this.showButtonInput = true;

      this.$nextTick(() => {
        this.$refs.button_input.focus();
      });
    },
    closeButtonInput() {
      this.showButtonInput = false;
    },
    validateName() {
      // TODO: Set limit on character length, use HTML regex?
      let valid = false;

      if (this.newButtonName === "") {
        this.raiseError("Empty button names not allowed");
      } else if (this.newButtonName.includes(" ")) {
        this.raiseError("Whitespace not allowed");
      } else if (this.buttons.includes(this.newButtonName)) {
        this.raiseError("Duplicates now allowed");
      } else valid = true;

      return valid;
    },
    addButton() {
      // FIXME: consider ordering of buttons
      if (this.validateName()) {
        this.buttons.unshift(this.newButtonName);
        this.newButtonName = "";

        this.error && this.lowerError();

        this.showButtonInput = false;

        this.$emit("input", this.buttons);
      }
    },
    renameButton(name, index) {
      console.log("This is a placeholder for the current renaming function");

      if (this.validateName()) {
        this.buttons[index] = this.buttons.splice(1, index, "Hello");
      }
      //this.newButtonName = name;
    },
    removeButton(name) {
      this.buttons = this.buttons.filter(button => button != name);
    }
  }
};
</script>

<!-- Locally scoped styles -->
<style scoped>
.rename-button {
  cursor: pointer;
}
</style>

<!-- Global Styles -->
<style>
/* FIXME: better way of doing this? */
.button-side-text {
  display: inline-block;
  vertical-align: -webkit-baseline-middle;
}

.tag-input input {
  padding: 0;
  border: none;
  box-shadow: none;
  background-color: transparent;
  text-align: center;
}

.tag-input input:active {
  box-shadow: none;
}

.tag-input input:focus {
  box-shadow: none;
}
</style>
