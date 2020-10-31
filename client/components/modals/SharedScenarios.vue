<template>
  <SharedItems name="shared scenarios">
    <template v-for="scenario in scenarioSet">
      <Scenario
        :key="scenario.id"
        v-if="scenario.public && !scenario.isMine"
        :scenario="scenario"
        duplicate
        @duplicate="duplicateScenario($event)"
      />
    </template>
  </SharedItems>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import SharedItems from "~/components/modals/SharedItems";
import Scenario from "~/components/cards/Scenario";

export default {
  components: { SharedItems, Scenario },
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
