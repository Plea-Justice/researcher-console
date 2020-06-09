<template>
  <section class="section container">
    <nav class="level container">
      <div class="level-left">
        <div class="level-item">
          <!-- TODO: Add last saved/auto save with button saving animation, disable button when fields aren't correct? -->
          <b-button type="is-primary">Save</b-button>
        </div>
        <b-button
          class="level-item"
          @click="collapse()"
        >{{ `${isCollapsed ? "Expand" : "Collapse"} All` }}</b-button>
        <b-button class="level-item" @click="addCondition(spec.scene)">Add Condition</b-button>
      </div>

      <div class="level-right">
        <div class="level-item">
          <b-field class="name">
            <b-input icon="filter-outline" placeholder="Filter"></b-input>
          </b-field>
        </div>
      </div>
    </nav>

    <div class="section">
      <div class="condition-titles">
        <h1
          v-for="i in numConditions"
          :key="i"
          class="condition-title subtitle"
        >{{ "Condition " + i }}</h1>
      </div>

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
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
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
      numConditions: "scenes/numConditions",
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

<style scoped>
.condition-titles {
  display: flex;
  flex-direction: row;
  column-gap: 30px;
  margin-left: 90px;
  margin-bottom: 25px;
}

.condition-title {
  flex: 0 0 350px;
  text-align: center;
}
</style>
