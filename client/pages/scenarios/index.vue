<template>
  <!-- FIXME: make this the current path -->
  <ItemLayout
    contentTitle="Scenarios"
    helpTitle="Scenario Management"
    :helpText="scenariosHelp.navbar"
  >
    <template v-slot:toolbar-start>
      <div class="level-item buttons">
        <ToolBarButton v-model="mode" @click="toggleAddMode()" :mode="Modes.ADD"
          >Add</ToolBarButton
        >
        <ToolBarButton v-model="mode" :mode="Modes.DUPLICATE"
          >Duplicate</ToolBarButton
        >
      </div>
    </template>

    <form v-show="mode === Modes.ADD" @submit.prevent="onSubmit()">
      <ItemCard ref="form-card" v-model="scenarioForm" save>
        <b-input
          v-model="scenarioForm.description"
          type="textarea"
          class="has-fixed-size"
          placeholder="Description"
          maxlength="100"
        />
      </ItemCard>
    </form>
    <ItemCard
      v-for="scenario in scenarioSet"
      :key="scenario.id"
      @selected="duplicate($event)"
      @remove="confirmDelete($event)"
      :selectable="mode === Modes.DUPLICATE"
      :item="scenario"
      close
      link
    >
      <p>{{ scenario.description }}</p>

      <p>DEBUG: {{ scenario }}</p>
    </ItemCard>
  </ItemLayout>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import ItemLayout from "~/components/layouts/ItemLayout";
import ToolBarButton from "~/components/ToolBarButton";
import ItemCard from "~/components/cards/ItemCard";

// Content for help fields
import { scenariosHelp } from "~/assets/helpText";

export default {
  name: "Scenarios",
  components: { ItemLayout, ToolBarButton, ItemCard },
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
        DUPLICATE: 2
      },
      // Set to DEFAULT mode
      mode: 0,
      // TODO: make this dynamic?
      scenarioForm: {
        name: "",
        description: ""
      }
    };
  },
  computed: {
    ...mapGetters({
      scenarioSet: "scenarios/scenarioSet"
    })
  },
  methods: {
    toggleAddMode() {
      if (this.mode === this.Modes.ADD)
        this.$nextTick(() => {
          this.$refs["form-card"].focus();
        });
    },
    ...mapActions({
      addScenario: "scenarios/addScenario",
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
          "Deleted scenarios are not recoverable.<br /><br />Are you sure you would like to delete this scenario?",
        confirmText: "Delete",
        type: "is-danger",
        hasIcon: true,
        onConfirm: () => this.removeScenario(event)
      });
    },
    onSubmit() {
      // Add the scenario to state
      this.addScenario(this.scenarioForm);

      // Reset the inputs
      this.scenarioForm = {
        name: "",
        description: ""
      };

      // Disable form
      this.mode = this.Modes.DEFAULT;
    }
  },
  head() {
    return {
      name: `${this.$siteConfig.title} | Scenarios`,
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
