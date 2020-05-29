<template>
  <section class="section">
    <div class="container">
      <div class="story-menu">
        <b-button @click="expand">
          {{
          `${isExpanded ? "Collapse" : "Expand"} All`
          }}
        </b-button>
        <b-button @click="addCondition(spec.scene)">Add Condition</b-button>
      </div>
    </div>

    <StoryFrame
      v-for="frame in frames"
      :key="`frame_${frame.index}`"
      :frame="frame"
      :allExpanded="isExpanded"
      :spec="spec"
      :manifest="manifest"
    />
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
    const isExpanded = true;

    return { isExpanded };
  },
  async asyncData({ params, $axios }) {
    //TODO: make this a global state
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
    expand() {
      this.isExpanded = !this.isExpanded;
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

<style scoped>
.story-menu {
  margin-bottom: 1.5rem;
}
</style>
