<template>
  <ItemLayout
    contentTitle="My Scenarios"
    helpTitle="Scenario Management"
    :helpText="scenariosHelp.navbar"
  >
    <template v-slot:toolbar-start>
      <div class="level-item buttons">
        <ToolBarButton @click="openFormModal()" :mode="Modes.ADD"
          >Create New Scenario</ToolBarButton
        >
      </div>
    </template>

    <p
      v-if="!scenarioSet.length"
      class="empty-text has-text-weight-medium is-size-5"
    >
      No scenarios exists!
      <br />Add a scenario from the toolbar to get started.
    </p>
    <template v-else>
      <template v-for="scenario in scenarioSet">
        <ItemCard
          :key="scenario.id"
          @selected="duplicate($event)"
          @remove="confirmDelete($event)"
          @edit="openFormModal($event, scenario)"
          @duplicate="duplicate($event)"
          :selectable="mode === Modes.DUPLICATE"
          :item="scenario"
          :itemType="'scenario'"
          link
          remove
          edit
          duplicate
        >
          <p class="content" v-if="scenario.description">
            {{ scenario.description }}
          </p>
          <p class="content is-small">
            Last Modified {{ posixTimeToHoursAgo(scenario.modified) }}
            <br />
            Created {{ posixTimeToHoursAgo(scenario.created) }}
          </p>
        </ItemCard>
      </template>
    </template>
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

// Last modified time
import { posixTimeToHoursAgo } from "~/assets/util";

export default {
  name: "Scenarios",
  components: { ItemLayout, ToolBarButton, ItemCard, ScenarioForm },
  async fetch({ store, params }) {
    await store.dispatch("scenarios/getScenarios");
  },
  data() {
    return {
      // import from JS file
      scenariosHelp: scenariosHelp,
      Modes: {
        DEFAULT: 0,
        ADD: 1,
        EDIT: 2
      },
      // Set to DEFAULT mode
      mode: 0,
      editId: null
    };
  },
  computed: {
    ...mapGetters({
      scenarioSet: "scenarios/scenarioSet"
    })
  },
  methods: {
    openFormModal(id = null, scenario = null) {
      this.$buefy.modal.open({
        parent: this,
        component: ScenarioForm,
        props: { id, scenario },
        hasModalCard: true,
        trapFocus: true
      });
    },
    ...mapActions({
      removeScenario: "scenarios/removeScenario",
      duplicateScenario: "scenarios/duplicateScenario"
    }),
    duplicate(eScenarioId) {
      this.duplicateScenario(eScenarioId);
      this.mode = this.Modes.DEFAULT;
    },
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
    },
    posixTimeToHoursAgo: posixTimeToHoursAgo
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
