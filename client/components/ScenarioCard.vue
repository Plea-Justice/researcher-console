<template>
  <div class="card has-radius-large">
    <!-- Card Header -->
    <header class="card-header has-top-radius-large">
      <div class="header-wrapper">
        <h1 v-if="!isForm" class="subtitle">{{ scenario.title }}</h1>
        <b-input
          v-else
          v-model="value.title"
          placeholder="title"
          class="flex-grow"
        />
      </div>
    </header>

    <!-- Card Body -->
    <div class="card-content flex-grow">
      <p v-if="!isForm">{{ scenario.description }}</p>
      <textarea
        v-else
        v-model="value.description"
        class="textarea has-fixed-size"
        placeholder="script"
      />
    </div>

    <!-- Card Footer -->
    <footer class="card-footer">
      <div class="card-footer-item buttons footer-buttons flex-left">
        <b-button
          v-if="!isForm"
          @click="removeScenario(scenario.id)"
          type="is-danger"
          icon-left="close"
        />
        <b-button
          v-else
          class="is-fullwidth clear-button-margin"
          type="is-primary"
          tag="input"
          native-type="submit"
          value="Save"
        />
      </div>
    </footer>
  </div>
</template>

<script>
// Import VueX
import { mapActions } from "vuex";

export default {
  name: "ScenarioCard",
  props: {
    scenario: {
      type: Object,
      required: false
    },
    value: {
      type: Object,
      required: false
    }
  },
  computed: {
    isForm() {
      return !!this.value;
    }
  },
  methods: {
    ...mapActions({
      removeScenario: "scenarios/removeScenario"
    })
  }
};
</script>

<style lang="scss" scoped>
.card {
  /* Card Size */
  width: 350px;
  /* Make card full-height */
  flex-grow: 1;
  /* Fix for card footer when using tiles */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

// Even out all padding between header, body, and footer
.card-header {
  padding: 0.75rem 1.5rem;
}

.card-footer {
  padding: 0.75rem;
}

.card-footer-item {
  padding: 0 0.75rem 0;
}

// FIXME: use Bulma SASS $radius-large variable
.has-radius-large {
  border-radius: 6px;
}

.header-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  flex-grow: 1;

  // Everything except last child & > :not(:last-child)
  & > :nth-last-child(n + 2) {
    margin-right: 0.75rem;
  }
}

.flex-grow {
  flex-grow: 1;
}

.footer-buttons {
  border: none;
  padding-bottom: 0;
  margin-bottom: 0;

  & > .button {
    margin-bottom: 0;
  }
}

.flex-left {
  justify-content: flex-start !important;
}
</style>
