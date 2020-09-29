<template>
  <!-- FIXME: should use focus & enter as a trigger -->
  <b-dropdown
    :triggers="['click']"
    v-bind="$attrs"
    v-model="innerValue"
    expanded
  >
    <!-- FIXME: add button class styles for border/outline, etc. -->
    <div
      :class="statusType"
      class="control button button-fix is-outlined is-fullwidth has-icons-left"
      tabindex="0"
      slot="trigger"
    >
      <span class="select is-fullwidth">
        <span class="mimic-select">
          <p class="truncate-text">{{ value ? value.name : "None" }}</p>
        </span>
      </span>
      <b-icon :icon="icon" size="is-small" class="is-left" />
    </div>

    <b-dropdown-item :value="null">
      None
    </b-dropdown-item>

    <!-- If value does not exists insert dummy value -->
    <b-dropdown-item v-if="invalidOldFile" :value="value">
      {{ value.name }}
    </b-dropdown-item>

    <b-dropdown-item
      v-for="file in options"
      class="dropdown-flex-item"
      :key="file.id"
      :value="{ id: file.id, name: file.name }"
    >
      <p>{{ file.name }}</p>
      <small class="flex-item-meta truncate-text">
        <span>{{ !file.isMine ? "" : `Shared by ${file.owner} ` }}</span>
        <span>{{ new Date(file.modified).toLocaleString() }}</span>
      </small>
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
import FormElementMixin from "buefy/src/utils/FormElementMixin";

export default {
  extends: FormElementMixin,
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
      //TODO: ideally deprecate this
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

<style lang="scss" scoped>
// This fixes button styling so it properly holds select
.button.control {
  height: 100%;
  padding: 0;
  background-color: transparent !important;

  // FIXME: changes ::after color incorrectly
  color: currentColor;
  &:hover,
  &:focus {
    color: currentColor;
  }

  & > .icon {
    margin-left: 0;
  }
}

// This class mimics Bulma's select element class to position the select elements text
.mimic-select {
  // Custom props to center text
  height: 100%;
  // width: 100%;
  display: flex;
  align-items: center;

  // Text positioning taken from Bulma's select element styling
  padding: calc(1.625em - 0.5625rem) 2.5em 1px;
}

// FIXME: make this global
.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-flex-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  // Gives dropdown equal spacing on left/right
  // By default text is essentially left-alligned
  padding-right: 1rem;
}

.flex-item-meta {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  // Truncate any child text
  // FIXME: make this a mixin
  & > * {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
