<template>
  <SharedItems name="shared scenarios">
    <template v-for="scenario in scenarioSet">
      <Scenario
        :key="scenario.id"
        v-if="scenario.public && scenario.owner !== user.name"
        :scenario="scenario"
        :labels="{duplicate: 'Copy to My Scenarios'}"
        duplicate
        @duplicate="duplicateScenario($event)"
        :link="false"
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
      scenarioSet: "scenarios/scenarioSet"
    })
  },
  methods: {
    ...mapActions({
      duplicateScenario: "scenarios/duplicateScenario"
    })
  }
};
</script>
