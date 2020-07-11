<template>
  <div>
    <NavBar v-if="true" :title="scenarioName" path="/scenarios" helpTitle="Scenario Story Editor"
      helpText="The simulation storyline progresses downwards. Each column is the variation of the storyline that will be
        presented to participants subject to the experimental condition specified at the top of the column.
        Click 'Properties' to edit the survey link to which participants will be redirected when they complete
        the simulation. 'Download Package' will create a fully configured, zipped simulation package, ready to deploy
        on any web server." />
  <!-- <button @click="store.dispatch('error/setError')">setError</button> -->
    <nuxt />
  </div>
</template>

<script>
// Import Components
import NavBar from "~/components/NavBar";

export default {
  components: { NavBar },
  data() {
    return {
      // FIXME: Name should come from manifest or user directory.
      scenarioName: "Grant Study, Hit and Run"
    };
  }
};
</script>
