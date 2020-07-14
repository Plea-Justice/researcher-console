<template>
  <div>
    <!-- FIXME: make this the current path -->
    <NavBar helpTitle="Scenario Management"
      helpText="On this page you may create and organize simulated scenarios. Click the name of any scenario to open the storyline editor." />

    <ToolBar>
      <template v-slot:start>
        <div class="level-item buttons">
          <b-button
            @click="toggleAddMode()"
            :type="EnabledModeBtnType(Modes.ADD)"
            :disabled="isDisabledMode(Modes.ADD)"
            >Add</b-button
          >
          <!-- Add button text labels on hover -->
          <b-button
            @click="toggleMode(Modes.DUPLICATE)"
            :type="EnabledModeBtnType(Modes.DUPLICATE)"
            :disabled="isDisabledMode(Modes.DUPLICATE)"
            >Duplicate</b-button
          >
        </div>
      </template>
    </ToolBar>

    <section class="section container">
      <h1 class="title">Scenarios</h1>

      <div class="grid">
        <form v-show="mode === Modes.ADD" @submit.prevent="onSubmit()">
          <ItemCard ref="form-card" v-model="scenarioForm" required save>
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
          :selection="mode === Modes.DUPLICATE"
          :item="scenario"
          close
          link
        >
          <p>{{ scenario.description }}</p>

          <p>DEBUG: {{ scenario }}</p>
        </ItemCard>
      </div>
    </section>
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import NavBar from "~/components/NavBar";
import ToolBar from "~/components/ToolBar";
import ItemCard from "~/components/cards/ItemCard";

export default {
  name: "Scenarios",
  components: { NavBar, ToolBar, ItemCard },
  async fetch({ store, params }) {
    await store.dispatch("scenarios/getScenarios");
  },
  data() {
    return {
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
    // FIXME: make this a mixin or seperate component
    isDisabledMode(ownMode) {
      return this.mode !== this.Modes.DEFAULT && this.mode !== ownMode;
    },
    EnabledModeBtnType(ownMode) {
      return this.mode === ownMode ? "is-success" : "";
    },
    toggleMode(ownMode) {
      this.mode =
        this.mode === this.Modes.DEFAULT ? ownMode : this.Modes.DEFAULT;
    },
    toggleAddMode() {
      this.toggleMode(this.Modes.ADD);

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
        title: 'Delete Scenario',
        message: 'Deleted scenarios are not recoverable.<br /><br />Are you sure you would like to delete this scenario?',
        confirmText: 'Delete',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: () => this.removeScenario(event)
      })
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

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 350px));
  gap: 15px;
}
</style>
