<template>
  <div>
    <NavBar :title="title" :helpTitle="helpTitle" :helpText="helpText" />

    <ToolBar ref="toolbar">
      <template v-slot:start>
        <slot name="toolbar-start" />
      </template>
      <template v-slot:end>
        <slot name="toolbar-end" />
      </template>
    </ToolBar>

    <section class="padded-responsive-container">
      <div>
        <slot name="default" />
      </div>
    </section>
  </div>
</template>

<script>
// Import Components
import NavBar from "~/components/NavBar";
import ToolBar from "~/components/ToolBar";

export default {
  name: "GenericLayout",
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
    }
  }
};
</script>
