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
        <ToolBarButton
          v-if="numSharedScenarios"
          @click="openSharedModal()"
          :value="sharedMode"
        >
          Shared Scenario Library
        </ToolBarButton>
      </div>
    </template>

    <template v-slot:toolbar-end>
      <b-field label="Batch Delete">
        <b-switch v-model="batchDelete" type="is-danger" />
      </b-field>
    </template>

    <!-- FIXME: switch to owner selector or remove
    <template v-slot:toolbar-end>
      <b-field v-if="scenarioSet.length > 1">
        <b-select v-model="sortBy">
          <option
            v-for="option in sortOptions"
            :key="option.key"
            :value="option.key"
          >
            {{ option.name }}
          </option>
        </b-select>
      </b-field>
    </template>
    -->

    <p
      v-if="!(scenarioSet.length - numSharedScenarios)"
      class="empty-text has-text-weight-medium is-size-5"
    >
      Your scenario library is empty!
      <br />
      To get started, create a new scenario or copy a template from the shared
      scenario library.
    </p>

    <div v-else class="item-grid">
      <template v-for="scenario in scenarioSet">
        <Scenario
          :key="scenario.id"
          v-if="scenario.owner === user.name"
          :scenario="scenario"
          remove
          @remove="deleteScenario($event)"
          edit
          @edit="openFormModal(scenario)"
          duplicate
          @duplicate="duplicateScenario($event)"
        />
      </template>
    </div>
  </ItemLayout>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import ItemLayout from "~/components/layouts/ItemLayout";
import ToolBarButton from "~/components/ToolBarButton";
import Scenario from "~/components/cards/Scenario";
import ScenarioForm from "~/components/modals/ScenarioForm";
import SharedScenarios from "~/components/modals/SharedScenarios";

// Mixins
import User from "~/mixins/User";

// Content for help fields
import { scenariosHelp } from "~/assets/helpText";

export default {
  name: "Scenarios",
  components: { ItemLayout, ToolBarButton, Scenario, ScenarioForm },
  mixins: [User],
  async fetch({ store, params }) {
    await store.dispatch("scenarios/getScenarios");
  },
  data() {
    const sortOptions = [
      { name: "Last Modified", key: "modified" },
      { name: "Newest", key: "created" },
      { name: "Name", key: "name" },
    ];

    return {
      // import from JS file
      scenariosHelp,

      batchDeleteState: false,
      addMode: false,
      sharedMode: false,

      sortOptions,
      sortBy: sortOptions[0].key,
    };
  },
  computed: {
    batchDelete: {
      get() {
        return this.batchDeleteState;
      },
      set(newValue) {
        if (newValue)
          this.$buefy.dialog.confirm({
            title: "Batch Delete Scenarios",
            message:
              "You will <b>not</b> be warned before deleting individual scenarios while active, deleted scenarios are <b>not recoverable</b>!",
            confirmText: "I Understand",
            type: "is-danger",
            hasIcon: true,
            onConfirm: () => (this.batchDeleteState = true),
          });
        else this.batchDeleteState = false;
      },
    },
    ...mapGetters({
      scenarioSet: "scenarios/scenarioSet",
    }),
    numSharedScenarios() {
      return this.scenarioSet.reduce(
        (acc, scenario) =>
          scenario.owner !== this.user.name ? (acc += 1) : acc,
        0
      );
    },
    sortedScenarios() {
      return this.scenarioSet.sort((scenario) => scenario[this.sortBy]);
    },
  },
  methods: {
    openFormModal(scenario) {
      this.$buefy.modal.open({
        parent: this,
        component: ScenarioForm,
        props: { scenario, user: this.user },
        hasModalCard: true,
        trapFocus: true,
      });
    },
    openSharedModal() {
      this.$buefy.modal.open({
        parent: this,
        component: SharedScenarios,
        hasModalCard: true,
        trapFocus: true,
      });
    },
    ...mapActions({
      removeScenario: "scenarios/removeScenario",
      duplicateScenario: "scenarios/duplicateScenario",
    }),
    deleteScenario(id) {
      if (!this.batchDelete)
        this.$buefy.dialog.confirm({
          title: "Delete Scenario",
          message:
            "Deleted scenarios are <b>not recoverable</b>! Are you sure you want to delete this scenario?",
          confirmText: "Delete",
          type: "is-danger",
          hasIcon: true,
          onConfirm: () => this.removeScenario(id),
        });
      else this.removeScenario(id);
    },
  },
  head() {
    return {
      title: `${this.$siteConfig.title} | Scenarios`,
      meta: [
        {
          hid: "description",
          name: "description",
          content: "List of available scenarios",
        },
      ],
    };
  },
};
</script>

<style scoped>
.empty-text {
  position: absolute;
}
</style>
