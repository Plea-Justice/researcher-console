<template>
  <!-- Level Toolbar -->
  <nav class="level padded-responsive-container sticky toolbar">
    <!-- Left Side Toolbar -->
    <div class="level-left">
      <slot name="start" />
    </div>

    <!-- Right Side Toolbar -->
    <div class="level-right">
      <slot name="end" />
      <b-field v-if="value" class="level-item">
        <b-input v-model="searchString" icon="filter-outline" placeholder="Filter" />
      </b-field>
    </div>
  </nav>
</template>

<script>
export default {
  name: "ToolBar",
  props: {
    value: {
      type: Array,
      required: false
    }
  },
  data() {
    return {
      searchString: ""
    };
  },
  computed: {
    adjustedSearchString() {
      return this.searchString.trim().toLowerCase();
    },
    filteredItems() {
      if (this.searchString === "") {
        return this.value;
      } else {
        console.log(
          this.value.filter(
            item =>
              item.name.toLowerCase().indexOf(this.adjustedSearchString) !== -1
          )
        );
      }
    }
  }
};
</script>

<style scoped>
.toolbar {
  margin-bottom: 0;
  /* Sticky below toolbar */
  top: 0;
  height: 4rem;
  background-color: whitesmoke;
}
</style>
