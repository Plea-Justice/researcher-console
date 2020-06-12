<template>
  <div>
    <!-- Level Toolbar -->
    <nav class="level padded-responsive-container sticky toolbar">
      <!-- Left Side Toolbar -->
      <div class="level-left">
        <!-- TODO: Add last saved/auto save with button saving animation, disable button when fields aren't correct? -->
        <b-button @click="test()" type="is-primary" class="level-item">Save</b-button>
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

    <!-- Titles -->
    <div class="sticky condition-bar">
      <div class="responsive-container condition-titles">
        <h1
          v-for="i in numConditions"
          :key="i"
          class="condition-title subtitle"
        >{{ "Condition " + i }}</h1>
      </div>
    </div>

    <div class="scrollable">
      <section class="responsive-container extend-frame">
        <!-- Frames -->
        <div v-for="(frame, index) in frames" :key="`frame_${index}`">
          <!--
          <StoryFrame :frame="frame" :allCollapsed="isCollapsed">
            <template v-slot:frame>
              <div
                v-for="scene in frame.scenes"
                :key="`frame_${frame.index}_scene${scene.id}`"
                class="scene"
              >
                <StoryCard :frameCollapsed="isCollapsed" :sceneIndex="scene.index" />
              </div>
            </template>
          </StoryFrame>
          -->

          <StoryFrame
            :ref="`frame_${index}`"
            :allCollapsed="isCollapsed"
            :frame="frame"
            :spec="spec"
            :manifest="manifest"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import StoryFrame from "~/components/StoryFrame";
import StoryCard from "~/components/StoryCard";

export default {
  name: "StoryBoard",
  layout: "StoryLayout",
  components: { StoryFrame, StoryCard },
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
    test() {
      this.$nextTick(() => {
        console.log(this.$refs);
      });
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
.scene {
  display: flex;
  flex: 0 0 350px;
  align-items: center;
  flex-direction: column;
  margin-right: 30px;
}

.test {
  z-index: 100;
  margin-bottom: 20px;
}

.responsive-container {
  margin: 0 4%;
}

.padded-responsive-container {
  padding: 0 4%;
}

.sticky {
  position: sticky;
  z-index: 5;
  background-color: #fffe;
}

.toolbar {
  /* Sticky below toolbar */
  top: 0;
  height: 5rem;
  background-color: whitesmoke;
}

.condition-bar {
  /* Sticky below toolbar */
  top: 5rem;
}

.condition-titles {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 3rem;
  padding-left: 75px;
}

.condition-title {
  flex: 0 0 350px;
  margin-right: 30px;
  margin-bottom: 0px;
  text-align: center;
}

.scrollable {
  overflow-y: hidden;
}

.extend-frame {
  width: max-content;
  margin-top: 1.3rem;
}
</style>
