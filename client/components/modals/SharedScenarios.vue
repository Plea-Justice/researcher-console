<template>
  <SharedItems>
    <template v-slot:header>
      <h1 class="modal-card-title">
        Shared Scenarios ({{ selectedScenarios.length }})
      </h1>
      <b-field v-if="sharedScenarioSet.length > 1">
        <b-autocomplete
          v-model="searchName"
          :data="searchList"
          placeholder="Search by scenario name"
          icon="search"
          clearable
        >
          <template slot="empty">No results found</template>
        </b-autocomplete>
      </b-field>
    </template>

    <template v-for="scenario in selectedScenarios">
      <Scenario
        :key="scenario.id"
        :scenario="scenario"
        :labels="{ duplicate: 'Copy to My Scenarios' }"
        duplicate
        @duplicate="duplicateScenarioHelper($event)"
        :link="false"
        hidepublic
      />
    </template>
  </SharedItems>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Mixins
import User from "~/mixins/User";

// Import Components
import SharedItems from "~/components/modals/SharedItems";
import Scenario from "~/components/cards/Scenario";

export default {
  components: { SharedItems, Scenario },
  mixins: [User],
  data() {
    return {
      searchName: "",
    };
  },
  computed: {
    ...mapGetters({
      scenarioSet: "scenarios/scenarioSet",
    }),
    sharedScenarioSet() {
      return this.scenarioSet.filter(
        (scenario) => scenario.public && scenario.owner !== this.user.name
      );
    },
    searchList() {
      return this.sharedScenarioSet
        .map((scenario) => scenario.name)
        .filter(
          (name) =>
            name.toLowerCase().indexOf(this.searchName.toLowerCase()) >= 0
        );
    },
    selectedScenarios() {
      return this.searchName === ""
        ? this.sharedScenarioSet
        : this.sharedScenarioSet.filter((scenario) =>
            this.searchList.includes(scenario.name)
          );
    },
  },
  methods: {
    ...mapActions({
      duplicateScenario: "scenarios/duplicateScenario",
    }),
    async duplicateScenarioHelper(id) {
      const numScenarios = this.scenarioSet.length;
      await this.duplicateScenario(id);
      if (this.scenarioSet.length > numScenarios)
        this.$buefy.toast.open({
          message: "Copied Scenario",
          type: "is-success",
        });
    },
  },
};
</script>
