<template>
  <SharedItems :name="`shared scenarios (${sharedScenarioSet.length})`">
    <template v-for="scenario in sharedScenarioSet">
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
  computed: {
    ...mapGetters({
      scenarioSet: "scenarios/scenarioSet",
    }),
    sharedScenarioSet() {
      return this.scenarioSet.filter(
        (scenario) => scenario.public && scenario.owner !== this.user.name
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
