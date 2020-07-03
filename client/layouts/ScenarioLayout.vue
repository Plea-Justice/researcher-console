<template>
  <div>
    <NavBar :title="scenarioName" path="/scenarios" help />

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
