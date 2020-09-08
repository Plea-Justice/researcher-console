<template>
  <b-dropdown
    class="selector-dropdown-button"
    :class="status.flag ? 'invalid-red-border' : 'valid-green-border'"
    :triggers="['click', 'focus']"
    v-bind="$attrs"
    v-model="innerValue"
    :icon="icon"
  >
    <div class="container" tabindex="0" slot="trigger">
      <span class="mt-5 ml-3 mb-1 is-pulled-left">{{value ? value.name : 'None'}}</span>
      <b-icon size="is-medium" class="has-text-primary is-pulled-right mt-5" :class="status.flag ? 'has-text-danger' : 'has-text-success'" icon="angle-down"></b-icon>
    </div>
    <b-dropdown-item :value="null">None</b-dropdown-item>
    <!-- If value does not exists insert dummy value -->
    <b-dropdown-item v-if="invalidOldFile" :value="value">{{ value.name }}</b-dropdown-item>
    <b-dropdown-item
      class="pr-3"
      v-for="file in options"
      :key="file.id"
      :value="{ id: file.id, name: file.name }"
    >
      <div class="level">
        <span class="level-left level-item">{{ file.name }}</span>
        <span class="level-right level-item is-size-7 has-text-right">
          {{file.isMine ? '' : `Shared by ${file.owner}`}}
          <br />
          {{new Date(file.modified).toLocaleString()}}
        </span>
      </div>
    </b-dropdown-item>
  </b-dropdown>
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

<style lang="scss" scoped>
.selector-dropdown-button {
  border: thin solid $border;
  border-radius: $radius;
}

.selector-dropdown-button:focus-within {
  border-color: $purple;
  box-shadow: 0 0 $radius-small $border-hover;
}

.invalid-red-border {
  border-color: $danger;
}

.valid-green-border {
  border-color: $success;
}
</style>