<template>
  <ItemLayout
    contentTitle="My Scenarios"
    helpTitle="Scenario Management"
    :helpText="scenariosHelp.navbar"
  >
    <!-- FIXME: switch to owner selector or remove
    <template v-slot:toolbar-start>
      <div class="level-item buttons">
        <ToolBarButton @click="openFormModal()" :value="addMode">
          Create New
        </ToolBarButton>
        <ToolBarButton @click="openSharedModal()" :value="sharedMode">
          Copy Shared
        </ToolBarButton>
      </div>
    </template>
    -->

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

    <p
      v-if="!scenarioSet.length"
      class="empty-text has-text-weight-medium is-size-5"
    >
      No scenarios exist!
      <br />Create a new scenario using the toolbar to get started.
    </p>

    <div v-else class="item-grid">
      <div v-for="scenario in scenarioSet" :key="scenario.id">
        <ItemCard
          v-if="!scenario.public"
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
          <p class="content description" v-if="scenario.description">
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
import SharedScenarios from "~/components/modals/SharedScenarios";

// Content for help fields
import { scenariosHelp } from "~/assets/helpText";

export default {
  name: "Scenarios",
  components: { ItemLayout, ToolBarButton, ItemCard, ScenarioForm },
  async fetch({ store, params }) {
    await store.dispatch("scenarios/getScenarios");
  },
  data() {
    const sortOptions = [
      { name: "Last Modified", key: "modified" },
      { name: "Newest", key: "created" },
      { name: "Name", key: "name" }
    ];

    return {
      // import from JS file
      scenariosHelp,

      addMode: false,
      sharedMode: false,

      sortOptions,
      sortBy: sortOptions[0].key
    };
  },
  computed: {
    ...mapGetters({
      scenarioSet: "scenarios/scenarioSet"
    }),
    sortedScenarios() {
      return this.scenarioSet.sort(scenario => scenario[this.sortBy]);
    }
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
    openSharedModal() {
      this.$buefy.modal.open({
        parent: this,
        component: SharedScenarios,
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

/* FIXME: this is duplicate in SharedScenarios modal */
.description {
  margin-bottom: auto;
  padding-bottom: 1.5rem;
  overflow-wrap: anywhere;
}
</style>
