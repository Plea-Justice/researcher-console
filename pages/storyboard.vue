<template>
  <section class="section">
    <div class="container">
      <nav class="level">
        <div class="level-left level-item buttons">
          <b-button @click="collapse()">
            {{
            `${isCollapsed ? "Expand": "Collapse"} All`
            }}
          </b-button>
          <b-button @click="addCondition(spec.scene)">Add Condition</b-button>
        </div>
        <b-field class="name">
          <b-input placeholder="Filter"></b-input>
        </b-field>
      </nav>
    </div>

    <div class="section">
      <StoryFrame
        v-for="(frame, index) in frames"
        :key="`frame_${index}`"
        :allCollapsed="isCollapsed"
        :frame="frame"
        :spec="spec"
        :manifest="manifest"
      />
    </div>
  </section>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import StoryFrame from "~/components/StoryFrame";

export default {
  name: "StoryBoard",
  layout: "StoryLayout",
  components: { StoryFrame },
  data() {
    const isCollapsed = false;

    return { isCollapsed };
  },
  async asyncData({ params, $axios }) {
    const spec = await (() =>
      import(`~/assets/spec.json`).then(m => m.default || m))();

    const manifest = await $axios.$get("/manifest.json");

    return { spec, manifest };
  },
  computed: {
    ...mapGetters({
      conditionNames: "scenes/conditionNames",
      frames: "scenes/frames"
    })
  },
  methods: {
    collapse() {
      this.isCollapsed = !this.isCollapsed;
    },
    ...mapActions({
      addCondition: "scenes/addCondition"
    })
  },
  async fetch({ store, params }) {
    await store.dispatch("scenes/getExperiment");
  },
  head() {
    return {
      title: `PleaBargain | StoryBoard`,
      meta: [
        {
          hid: "description",
          name: "description",
          content: "The StoryBoard Timeline"
        }
      ]
    };
  }
};
</script>
