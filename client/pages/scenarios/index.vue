<template>
  <div>
    <!-- FIXME: make this the current path -->
    <NavBar help />

    <ToolBar>
      <template v-slot:start>
        <div class="level-item buttons">
          <b-button
            @click="toggleAddMode()"
            :type="EnabledModeBtnType(Modes.ADD)"
            :disabled="isDisabledMode(Modes.ADD)"
          >Add</b-button>
          <!-- Add button text labels on hover -->
          <b-button
            @click="toggleMode(Modes.DUPLICATE)"
            :type="EnabledModeBtnType(Modes.DUPLICATE)"
            :disabled="isDisabledMode(Modes.DUPLICATE)"
          >Duplicate</b-button>
        </div>
      </template>
    </ToolBar>

    <section class="section container">
      <h1 class="title">Scenarios</h1>

      <div class="grid">
        <form v-show="mode === Modes.ADD" @submit.prevent="onSubmit()">
          <ItemCard ref="form-card" v-model="scenarioData" save>
            <textarea
              v-model="scenarioData.description"
              @remove="removeScenario($event)"
              class="textarea has-fixed-size"
              placeholder="script"
            />
          </ItemCard>
        </form>
        <ItemCard
          v-for="scenario in scenarioSet"
          :key="scenario.id"
          @click="duplicate($event)"
          @remove="removeScenario($event)"
          :item="scenario"
          :id="scenario.id"
          :selection="mode === Modes.DUPLICATE"
          link
          close
        >
          <p>{{ scenario.description }}</p>
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
import ItemCard from "~/components/ItemCard";

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
      scenarioData: {
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
          this.$refs["form-card"].$refs["form-card-input"].focus();
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
    onSubmit() {
      // Add the scenario to state
      this.addScenario(this.scenarioData);

      // Reset the inputs
      this.scenarioData = {
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}
</style>
