<template>
  <ItemLayout
    contentTitle="My Scenarios"
    helpTitle="Scenario Management"
    :helpText="scenariosHelp.navbar"
  >
    <template v-slot:toolbar-start>
      <div class="level-item buttons">
        <ToolBarButton @click="openFormModal()" :value="addMode">
          Create New
        </ToolBarButton>
        <ToolBarButton :value="sharedMode">
          Copy Shared
        </ToolBarButton>
      </div>
    </template>

    <p
      v-if="!scenarioSet.length"
      class="empty-text has-text-weight-medium is-size-5"
    >
      No scenarios exist!
      <br />Create a new scenario using the toolbar to get started.
    </p>

    <div v-else class="item-grid">
        <ItemCard
          v-for="scenario in scenarioSet"
          :key="scenario.id"
          :item="scenario"
          remove
          @remove="confirmDelete($event)"
          edit
          @edit="openFormModal(scenario)"
          duplicate
          @duplicate="duplicateScenario($event)"
          :itemType="'scenario'"
          link
        >
          <p class="content" v-if="scenario.description">
            {{ scenario.description }}
          </p>
          <p class="content is-small">
            <span v-if="scenario.modified !== scenario.created">
              Last Modified {{ scenario.modified | timeToNow }}
            </span>
            <br />
            <span>Created {{ scenario.created | timeToNow }}</span>
          </p>
        </ItemCard>
    </div>
  </ItemLayout>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import ItemLayout from "~/components/layouts/ItemLayout";
import ToolBarButton from "~/components/ToolBarButton";
import ItemCard from "~/components/cards/ItemCard";
import ScenarioForm from "~/components/modals/ScenarioForm";

// Content for help fields
import { scenariosHelp } from "~/assets/helpText";

export default {
  name: "Scenarios",
  components: { ItemLayout, ToolBarButton, ItemCard, ScenarioForm },
  async fetch({ store, params }) {
    await store.dispatch("scenarios/getScenarios");
  },
  data() {
    return {
      // import from JS file
      scenariosHelp,

      addMode: false,
      sharedMode: false
    };
  },
  computed: {
    ...mapGetters({
      scenarioSet: "scenarios/scenarioSet"
    })
  },
  methods: {
    openFormModal(scenario) {
      this.$buefy.modal.open({
        parent: this,
        component: ScenarioForm,
        props: { scenario },
        hasModalCard: true,
        trapFocus: true
      });
    },
    ...mapActions({
      removeScenario: "scenarios/removeScenario",
      duplicateScenario: "scenarios/duplicateScenario"
    }),
    confirmDelete(event) {
      this.$buefy.dialog.confirm({
        title: "Delete Scenario",
        message:
          "Deleted scenarios are not recoverable! Are you sure you want to delete this scenario?",
        confirmText: "Delete",
        type: "is-danger",
        hasIcon: true,
        onConfirm: () => this.removeScenario(event)
      });
    }
  },
  head() {
    return {
      title: `${this.$siteConfig.title} | Scenarios`,
      meta: [
        {
          hid: "description",
          name: "description",
          content: "List of available scenarios"
        }
      ]
    };
  }
};
</script>

<style scoped>
.empty-text {
  position: absolute;
}
</style>
