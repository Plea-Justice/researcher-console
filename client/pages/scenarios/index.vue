<template>
  <div>
    <!-- FIXME: make this the current path -->
    <NavBar help />

    <ToolBar ref="toolbar">
      <template v-slot:start>
        <div class="level-item buttons">
          <b-button
            class="level-item"
            :disabled="openForm"
            @click="openScenarioForm()"
            >Add Scenario</b-button
          >
        </div>
      </template>
    </ToolBar>

    <section class="section container">
      <h1 class="title">Scenarios</h1>

      <div class="grid">
        <form v-show="openForm" ref="form" @submit.prevent="onSubmit()">
          <ItemCard v-model="scenarioData">
            <textarea
              v-model="scenarioData.description"
              class="textarea has-fixed-size"
              placeholder="script"
            />
          </ItemCard>
        </form>
        <ItemCard
          v-for="scenario in scenarioSet"
          :key="scenario.id"
          :item="scenario"
          link
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
    const openForm = false;
    const scenarioData = {
      name: "",
      description: ""
    };

    return { openForm, scenarioData };
  },
  computed: {
    ...mapGetters({
      scenarioSet: "scenarios/scenarioSet"
    })
  },
  methods: {
    openScenarioForm() {
      this.openForm = true;
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
      this.openForm = false;
    },
    ...mapActions({
      addScenario: "scenarios/addScenario"
    })
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
