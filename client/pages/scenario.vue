<template>
  <div>
    <ToolBar ref="toolbar">
      <template v-slot:start>
        <div class="level-item buttons">
          <b-button @click="saveScenario(scenarioMeta.id)" type="is-primary">Save</b-button>
          <b-button @click="collapse()">
            {{
            `${isCollapsed ? "Expand" : "Collapse"} All`
            }}
          </b-button>
          <b-button @click="addCondition()">Add Condition</b-button>
        </div>
      </template>
      <template v-slot:end>
        <div class="level-item">
          <div class="buttons">
            <b-button @click="uploadModal()" type="is-primary" icon-left="file-upload">Upload Asset</b-button>
            <b-button
              @click="downloadZip()"
              type="is-primary"
              icon-left="folder-download"
            >Download Package</b-button>
          </div>
        </div>
        <b-field class="level-item">
          <b-input icon="filter-outline" placeholder="Filter" />
        </b-field>
      </template>
    </ToolBar>

    <!-- Titles -->
    <div ref="titles" class="sticky condition-bar">
      <div class="responsive-container condition-titles">
        <div v-for="index in numConditions" :key="index" class="condition-title">
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
    <div @scroll="handleScroll($event)" ref="horizontalScroll" class="scrollable">
      <section ref="frames" class="responsive-container">
        <!-- Frames -->
        <!-- NOTE: for some reason keying without the index causes strange update bahvior conflicting with scrollToFrame -->
        <SceneFrame
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
import ToolBar from "~/components/ToolBar";
import UploadModal from "~/components/UploadModal";
import HelpSidebar from "~/components/HelpSidebar";
import SceneFrame from "~/components/SceneFrame";

// Import Helper Functions
import { throttle } from "~/assets/util";

export default {
  name: "Scenario",
  layout: "StoryLayout",
  components: { ToolBar, UploadModal, HelpSidebar, SceneFrame },
  async fetch({ store, params }) {
    await store.dispatch("scenario/getScenario");
    await store.dispatch("assets/getAssets");
  },
  data() {
    const isCollapsed = false;

    return { isCollapsed };
  },
  computed: {
    // FIXME: make this 1 getter
    ...mapGetters({
      scenarioMeta: "scenario/scenarioMeta",
      numConditions: "scenario/numConditions",
      frameSet: "scenario/frameSet"
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
      this.$nextTick(() => {
        const headerHeight =
          this.$refs["toolbar"].$el.clientHeight +
          this.$refs["titles"].clientHeight;

        const frameTopPos = this.$refs.frames.children[
          frameIndex
        ].getBoundingClientRect().top;

        window.scrollTo({
          top: frameTopPos - headerHeight + window.pageYOffset,
          behavior: "smooth"
        });
      });

      // Scroll so that the element is at the top of the view
    },
    collapse() {
      this.isCollapsed = !this.isCollapsed;
    },
    uploadModal() {
      this.$buefy.modal.open({
        parent: this,
        component: UploadModal,
        hasModalCard: true,
        trapFocus: true
      });
    },
    downloadZip() {
      this.$buefy.toast.open({
        message: "Zip download will begin momentarily.",
        type: "is-success"
      });
    },
    ...mapActions({
      addCondition: "scenario/addCondition",
      removeCondition: "scenario/removeCondition",
      saveScenario: "scenario/saveScenario"
    })
  },
  head() {
    // FIXME: use global var for title
    return {
      title: `PleaBargain | StoryBoard`,
      meta: [
        {
          hid: "description",
          name: "description",
          content: "StoryBoard Timeline"
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
}

.condition-bar {
  margin-top: 2rem;
  overflow-x: hidden;
  /* Sticky below toolbar */
  top: 5rem;
  margin-bottom: 0.25rem;
  background-color: #fffe;
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
