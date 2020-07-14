<template>
  <div>
    <NavBar :helpTitle="helpTitle" :helpText="helpText" />

    <ToolBar ref="toolbar">
      <template v-slot:start>
        <slot name="toolbar-start" />
      </template>
      <template v-slot:end>
        <slot name="toolbar-end" />
      </template>
    </ToolBar>

    <section class="section container">
      <h1 class="title">{{ contentTitle }}</h1>

      <div class="grid">
        <slot name="default" />
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

export default {
  name: "ItemLayout",
  components: { NavBar, ToolBar },
  props: {
    title: {
      type: String,
      required: false
    },
    path: {
      type: String,
      required: false
    },
    helpTitle: {
      type: String,
      required: false
    },
    helpText: {
      type: String,
      required: false
    },
    contentTitle: {
      type: String,
      required: false
    }
  }
};
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 350px));
  gap: 15px;
}
</style>
