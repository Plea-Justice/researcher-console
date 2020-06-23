<template>
  <div>
    <!-- Level Toolbar -->
    <nav ref="toolbar" class="level padded-responsive-container sticky toolbar">
      <!-- Left Side Toolbar -->
      <div class="level-left">
        <!-- TODO: Add last saved/auto save with button saving animation, disable button when fields aren't correct? -->
        <b-button type="is-primary" class="level-item">Save</b-button>
        <b-button class="level-item" @click="collapse()">
          {{ `${isCollapsed ? "Expand" : "Collapse"} All` }}
        </b-button>
        <b-button class="level-item" @click="addCondition(spec.scene)"
          >Add Condition</b-button
        >
      </div>

      <!-- Right Side Toolbar -->
      <div class="level-right">
        <b-field class="level-item">
          <b-input icon="filter-outline" placeholder="Filter"></b-input>
        </b-field>
      </div>
    </nav>

    <!-- Titles -->
    <div ref="titles" class="sticky condition-bar">
      <div class="responsive-container condition-titles">
        <div
          v-for="index in numConditions"
          :key="index"
          class="condition-title"
        >
          <b-button
            @click="removeCondition(index - 1)"
            type="is-text"
            icon-left="close"
            class="close-button"
          />
          <h1 class="subtitle">{{ "Condition " + index }}</h1>
        </div>
      </div>
    </div>

    <!-- Scrolling Wrapper -->
    <div
      @scroll="handleScroll($event)"
      ref="horizontalScroll"
      class="scrollable"
    >
      <section ref="frames" class="responsive-container">
        <!-- Frames -->
        <!-- TODO: internalize isFirst/isLast for Frame? -->
        <StoryFrame
          v-for="(frame, index) in frameSet"
          :key="`${frame.id}_${index}`"
          @scroll-to="scrollToFrame($event)"
          :frame="frame"
          :allCollapsed="isCollapsed"
          :isFirst="index === 0"
          :isLast="index === frameSet.length - 1"
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

// Import Helper Functions
import { throttle } from "~/assets/util";

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
      frameSet: "scenes/frameSet",
      numConditions: "scenes/numConditions"
    })
  },
  methods: {
    handleScroll: throttle(function(event) {
      const leftScroll = event.target.scrollLeft;

      // Target elements you want to move now
      this.$refs.titles.scrollLeft = leftScroll;
      //TODO: only update add button on current frame(s)
    }, 20),
    scrollToFrame(frameIndex) {
      const headerHeight =
        this.$refs["toolbar"].clientHeight + this.$refs["titles"].clientHeight;

      const frameTopPos = this.$refs.frames.children[
        frameIndex
      ].getBoundingClientRect().top;

      window.scrollTo({
        top: frameTopPos - headerHeight + window.pageYOffset,
        behavior: "smooth"
      });

      // Scroll so that the element is at the top of the view
    },
    collapse() {
      this.isCollapsed = !this.isCollapsed;
    },
    ...mapActions({
      addCondition: "scenes/addCondition",
      removeCondition: "scenes/removeCondition"
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

<style lang="scss" scoped>
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
  overflow-x: hidden;
  /* Sticky below toolbar */
  top: 5rem;
  margin-bottom: 0.25rem;
}

.condition-titles {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 3rem;
  padding-left: 75px;
}

.condition-title {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 0 0 350px;
  margin-right: 30px;
}

.close-button {
  color: red;
  /* Shift left so title is centerd */
  width: 1rem;
  margin-left: -1rem;

  &:hover {
    color: red;
  }
}

.scrollable {
  overflow-y: hidden;
}
</style>
