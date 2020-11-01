<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Condition {{ condition.index + 1 }}</p>
    </header>
    <section class="modal-card-body">
      <b-tabs position="is-centered">
        <b-tab-item label="Tags">
          <template v-if="!condition.tags.length">
            <p>No tags currently exist, add some to get started</p>
          </template>
          <b-taglist v-else>
            <b-tag v-for="tag in condition.tags" :key="tag">{{ tag }}</b-tag>
          </b-taglist>
        </b-tab-item>

        <b-tab-item label="Colors">
          <b-field label="slot">
            <p class="control">
              <b-button :style="`background-color: red`" />
            </p>
            <b-input />
          </b-field>

          <!-- <b-dropdown class="dropdown-grid">
            <b-button
              type="is-primary"
              label="Click"
              slot="trigger"
              slot-scope="{ active }"
            />
            <b-dropdown-item
              v-for="item in [1, 2, 3, 4, 5]"
              :key="item"
              class="dropdown-grid-item"
            >
              Test {{ item }}
            </b-dropdown-item>
          </b-dropdown>
          -->
        </b-tab-item>
        <b-tab-item label="Features">
          <b-field label="Slot">
            <b-numberinput controls-position="compact" min="0" />
          </b-field>
        </b-tab-item>
        <b-tab-item label="Custom" />
      </b-tabs>
    </section>
    <footer class="modal-card-foot"></footer>
  </div>
</template>

<script>
// Import VueX
import { mapActions } from "vuex";

export default {
  props: {
    condition: {
      type: Object,
      required: true
    }
  }
};
</script>

<style>
.dropdown-grid .dropdown-content {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.dropdown-grid-item {
  width: fit-content !important;
  padding: 0.25rem !important;
}
</style>
