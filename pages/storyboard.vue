<template>
  <div>
    <!-- Level Toolbar -->
    <nav class="level section responsive-container">
      <!-- Left Side Toolbar -->
      <div class="level-left">
        <!-- TODO: Add last saved/auto save with button saving animation, disable button when fields aren't correct? -->
        <b-button type="is-primary" class="level-item">Save</b-button>
        <b-button
          class="level-item"
          @click="collapse()"
        >{{ `${isCollapsed ? "Expand" : "Collapse"} All` }}</b-button>
        <b-button class="level-item" @click="addCondition(spec.scene)">Add Condition</b-button>
      </div>

      <!-- Right Side Toolbar -->
      <div class="level-right">
        <b-field class="level-item">
          <b-input icon="filter-outline" placeholder="Filter"></b-input>
        </b-field>
      </div>
    </nav>

    <!-- Story Wrapper -->
    <div class="scrollable">
      <section class="section responsive-container extend-frame">
        <!-- Titles -->
        <div class="condition-titles">
          <h1
            v-for="i in numConditions"
            :key="i"
            class="condition-title subtitle"
          >{{ "Condition " + i }}</h1>
        </div>

        <!-- Frames -->
        <StoryFrame
          v-for="(frame, index) in frames"
          :key="`frame_${index}`"
          :allCollapsed="isCollapsed"
          :frame="frame"
          :spec="spec"
          :manifest="manifest"
        />
      </section>
    </div>
  </div>
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
.responsive-container {
  margin: 0 4%;
}

.scrollable {
  overflow-y: hidden;
}

.extend-frame {
  width: max-content;
}

.condition-titles {
  display: flex;
  flex-direction: row;
  margin-left: 75px;
  margin-bottom: 25px;
}

.condition-title {
  flex: 0 0 350px;
  margin-right: 30px;
  text-align: center;
}
</style>
