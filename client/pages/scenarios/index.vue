<template>
  <ItemLayout
    contentTitle="Scenarios"
    helpTitle="Scenario Management"
    :helpText="scenariosHelp.navbar"
  >
    <template v-slot:toolbar-start>
      <div class="level-item buttons">
        <ToolBarButton v-model="mode" @click="toggleAddMode()" :mode="Modes.ADD">Add</ToolBarButton>
        <ToolBarButton
          v-model="mode"
          :mode="Modes.DUPLICATE"
          :disabled="!scenarioSet.length"
        >Duplicate</ToolBarButton>
      </div>
    </template>

    <ScenarioForm
      ref="save_form"
      v-show="mode === Modes.ADD"
      @close="closeForm()"
      @submit="onSaveSubmit()"
      :scenarioForm="scenarioForm"
    />

    <p
      v-if="mode === Modes.DEFAULT && !scenarioSet.length"
      class="empty-text has-text-weight-medium is-size-5"
    >
      No scenarios exists!
      <br />Add a scenario from the toolbar to get started.
    </p>
    <template v-else>
      <template v-for="scenario in scenarioSet">
        <ScenarioForm
          ref="edit_form"
          v-if="mode === Modes.EDIT && scenario.id === editId"
          :key="scenario.id"
          @close="closeForm()"
          @submit="onEditSubmit()"
          :scenarioForm="scenarioForm"
        />

        <ItemCard
          v-else
          :key="scenario.id"
          @selected="duplicate($event)"
          @remove="confirmDelete($event)"
          @edit="setEditMode($event)"
          :selectable="mode === Modes.DUPLICATE"
          :item="scenario"
          close
          link
        >
          <p class="content">{{ scenario.description }}</p>
          <p class="content is-small">
            Last Modified {{ posixTimeToHoursAgo(scenario.modified) }}<br/>
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
import ScenarioForm from "~/components/cards/ScenarioForm";

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
    // Template for Form
    const ScenarioForm = {
      name: "",
      description: ""
    };

    return {
      // import from JS file
      scenariosHelp: scenariosHelp,
      Modes: {
        DEFAULT: 0,
        ADD: 1,
        DUPLICATE: 2,
        EDIT: 3
      },
      // Set to DEFAULT mode
      mode: 0,
      editId: null,

      ScenarioForm,
      scenarioForm: Object.assign({}, ScenarioForm)
    };
  },
  computed: {
    ...mapGetters({
      scenarioSet: "scenarios/scenarioSet"
    })
  },
  methods: {
    closeForm() {
      if (this.mode === this.Modes.EDIT) this.editId = null;
      this.mode = this.Modes.DEFAULT;
      this.scenarioForm = Object.assign({}, this.ScenarioForm);
    },
    focusForm() {
      this.$refs.save_form.focus();
    },
    setEditMode(eScenarioId) {
      this.mode = this.Modes.EDIT;
      this.editId = eScenarioId;
    },
    toggleAddMode() {
      this.mode === this.Modes.ADD
        ? this.focusForm()
        : (this.scenarioForm = Object.assign({}, this.ScenarioForm));
    },
    ...mapActions({
      addScenario: "scenarios/addScenario",
      removeScenario: "scenarios/removeScenario",
      editScenario: "scenarios/editScenario",
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
    onSaveSubmit() {
      if (
        this.scenarioSet.some(({ name }) => name === this.scenarioForm.name)
      ) {
        this.$buefy.toast.open({
          message: "A scenario with the same name already exists",
          type: "is-danger"
        });

        // Clear name and re-focus on name input
        this.scenarioForm.name = "";
        this.focusForm();
      } else {
        // Add the scenario to state
        this.addScenario(this.scenarioForm);
        this.closeForm();
      }
    },
    onEditSubmit() {
      // Add the scenario to state
      this.editScenario({ id: this.editId, ...this.scenarioForm });

      this.closeForm();
      this.editId = null;
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
