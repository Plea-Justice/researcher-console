<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Shared Scenarios</p>
    </header>
    <section class="modal-card-body">
      <div class="item-grid">
        <div v-for="scenario in scenarioSet" :key="scenario.id">
          <ItemCard
            v-if="scenario.public && !scenario.isMine"
            :item="scenario"
            :itemType="'scenario'"
            duplicate
            @duplicate="duplicateScenario($event)"
            link
          >
            <p class="content description" v-if="scenario.description">
              {{ scenario.description }}
            </p>
            <p class="content is-small">
              <span>Shared by {{scenario.owner}}</span>
              <br />
              <span v-if="scenario.modified">
                Last Modified {{ scenario.modified | timeToNow }}
              </span>
              <br />
              <span>Created {{ scenario.created | timeToNow }}</span>
            </p>
          </ItemCard>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import ItemCard from "~/components/cards/ItemCard";

export default {
  components: { ItemCard },
  computed: {
    ...mapGetters({
      scenarioSet: "scenarios/scenarioSet"
    })
  },
  methods: {
    ...mapActions({
      duplicateScenario: "scenarios/duplicateScenario"
    })
  }
};
</script>

<style>
/* FIXME: This will break things */
.animation-content {
  max-width: unset !important;
}
</style>

<style scoped>
.modal-card {
  width: 90vw;
}

.description {
  margin-bottom: auto;
  padding-bottom: 1.5rem;
  overflow-wrap: anywhere;
}

.modal-card-body {
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

.item-grid {
  padding: 1rem 2rem;
}
</style>
