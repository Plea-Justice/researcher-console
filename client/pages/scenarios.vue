<template>
  <div>
    <b-navbar type="is-dark">
      <template slot="brand">
        <b-navbar-item tag="div">
          <n-link class="navbar-item" to="/">
            <h1 class="subtitle has-text-light">Plea Bargain</h1>
          </n-link>
        </b-navbar-item>
      </template>

      <template slot="start">
        <b-navbar-item tag="div">
          <div class="buttons">
            <!-- Upload Button -->
            <b-button @click="uploadModal()" type="is-primary" icon-left="file-upload">Upload Asset</b-button>
          </div>
        </b-navbar-item>
      </template>

      <template slot="end">
        <b-navbar-item tag="div">
          <div class="buttons">
            <!-- Logout Button -->
            <b-button
              @click="logout()"
              type="is-danger"
              icon-left="exit-run"
            >Log Out, {{ userName }}</b-button>

            <!-- Help Menu -->
            <HelpSidebar :helpInfo="helpInfo" />
          </div>
        </b-navbar-item>
      </template>
    </b-navbar>

    <nav ref="toolbar" class="level toolbar">
      <!-- Left Side Toolbar -->
      <div class="level-left">
        <b-button class="level-item" :disabled="openForm" @click="openScenarioForm()">Add Scenario</b-button>
      </div>

      <!-- Right Side Toolbar -->
      <div class="level-right">
        <b-field class="level-item"></b-field>
      </div>
    </nav>

    <section class="section container">
      <h1 class="title">Scenarios</h1>

      <div class="grid">
        <form v-show="openForm" ref="form" @submit.prevent="onSubmit()">
          <ScenarioCard v-model="scenarioData" />
        </form>
        <ScenarioCard v-for="scenario in scenarioSet" :key="scenario.id" :scenario="scenario" />
      </div>
    </section>
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import ScenarioCard from "~/components/ScenarioCard";

export default {
  name: "ScenarioBoard",
  components: { ScenarioCard },
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
  }
};
</script>

<style>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.toolbar {
  height: 5rem;
  padding: 0 4%;
  background-color: whitesmoke;
}
</style>
