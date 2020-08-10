<template>
  <div ref="scroll" class="scroll-wrapper">
    <NavBar
      :title="title"
      :logout="logout"
      helpTitle="Scenario Story Editor"
      :helpText="scenarioHelp.navbar"
      path="/scenarios"
      class="horizontal-sticky"
    />
    <slot />
  </div>
</template>

<script>
import NavBar from "~/components/NavBar";

// Content for help fields
import { scenarioHelp } from "~/assets/helpText";

// Import Utilities
import { noop } from "~/assets/util";

export default {
  name: "ScenarioLayout",
  components: {
    NavBar
  },
  props: {
    title: {
      required: true,
      type: String
    },
    logout: {
      required: false,
      type: Function,
      default: noop
    }
  },
  data() {
    return {
      // import from JS file
      scenarioHelp: scenarioHelp
    };
  },
  head() {
    return {
      title: `${this.$siteConfig.title} | ${this.title}`,
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Scenario Chart"
        }
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
.scroll-wrapper {
  height: 100vh;
  width: 100%;
  overflow-x: scroll;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  overflow-anchor: none;
}

.horizontal-sticky {
  @include sticky();
  left: 0;
}
</style>
