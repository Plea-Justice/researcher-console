<template>
  <div class="frame" :style="numColumns">
    <!-- Sidebar -->
    <aside class="sidebar is-relative">
      <div class="box absolute-box" />

      <div class="buttons">
        <!-- Collapse Button -->
        <b-button
          @click="collapse()"
          :icon-left="`chevron-${isCollapsed ? 'down' : 'up'}`"
          size="is-medium"
          class="space-button"
          :class="isCollapsed ? 'no-space-bottom' : 'space-bottom'"
        />

        <!-- Frame up/down buttons -->
        <!-- FIXME: make these buttons move your view up/down using internal anchors/references -->
        <b-button
          v-if="!isFirst && !isCollapsed"
          @click="moveFrameUp(frame.index)"
          type="is-text"
          size="is-large"
          icon-right="chevron-up"
          class="move-button"
        />
        <b-button
          v-if="!isLast && !isCollapsed"
          @click="moveDown()"
          type="is-text"
          size="is-large"
          icon-right="chevron-down"
          class="move-button"
        />
      </div>
    </aside>
    <div
      class="scene"
      v-for="scene in frame.scenes"
      :key="
        `frame_${scene.index.frame}_condition_${scene.index.scene}_${
          scene.props ? scene.props.name : `blank_${scene.id}`
        }`
      "
    >
      <!-- FIXME: fully move out blank scene handling (Have to adjusts StoryScene) scoped prop vars? -->
      <StoryCard
        v-if="scene.props == null"
        :frameCollapsed="isCollapsed"
        :sceneIndex="scene.index"
      />

      <StoryScene
        v-else
        :frameCollapsed="isCollapsed"
        :scene="scene"
        :spec="spec"
        :manifest="manifest"
      />

      <div class="scene-button">
        <b-button
          v-if="scene.props != null"
          @click="addScene({ index: scene.index, scene: spec.scene })"
          type="is-light"
          icon-left="plus"
          size="is-medium"
        />
      </div>
    </div>
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import StoryCard from "~/components/StoryCard";
import StoryScene from "~/components/StoryScene";

export default {
  name: "StoryFrame",
  components: { StoryCard, StoryScene },
  props: {
    frame: {
      type: Object,
      required: true
    },
    allCollapsed: {
      type: Boolean,
      required: true
    },
    spec: {
      type: Object,
      required: true
    },
    manifest: {
      type: Object,
      required: true
    }
  },
  data() {
    const selfCollapsed = false;

    const displayColumns = this.frame.scenes.length;

    return { selfCollapsed, displayColumns };
  },
  computed: {
    isCollapsed() {
      return this.allCollapsed || this.selfCollapsed;
    },
    ...mapGetters({
      getIsFirst: "scenes/isFirst",
      getIsLast: "scenes/isLast"
    }),
    isFirst() {
      return this.getIsFirst(this.frame.index);
    },
    isLast() {
      return this.getIsLast(this.frame.index);
    },
    numColumns() {
      return { "--num-columns": this.frame.scenes.length };
    }
  },
  methods: {
    collapse() {
      this.selfCollapsed = !this.selfCollapsed;
    },
    ...mapActions({
      moveFrameUp: "scenes/moveFrameUp",
      moveFrameDown: "scenes/moveFrameDown",
      addScene: "scenes/addScene"
    }),
    moveDown() {
      this.moveFrameDown(this.frame.index);

      console.log(this.$refs);

      //const topPos = element.getBoundingClientRect().top + window.pageYOffset;
      /*
      window.scrollTo({
        top: topPos, // scroll so that the element is at the top of the view
        behavior: "smooth" // smooth scroll
      }); */
    }
  }
};
</script>

<style scoped>
.frame {
  display: flex;
}

.sidebar {
  flex-basis: 60px;
  margin-right: 15px;
}

.scene {
  display: flex;
  flex: 0 0 350px;
  align-items: center;
  flex-direction: column;
  margin-right: 30px;
}

.scene-button {
  display: flex;
  align-items: center;
  flex-grow: 0;
  height: 125px;
}

.absolute-box {
  position: absolute;
  margin-left: -1.25rem;
  margin-top: -1.25rem;
  height: calc(100% - 125px + 1.25rem * 2);
  width: calc(100% + (350px + 30px) * var(--num-columns) + 1.25rem * 2);
}

.space-button {
  margin-top: 0.75rem;
  margin-left: 0.25rem;
}

.space-bottom {
  margin-bottom: 2rem;
}

.no-space-bottom {
  margin-bottom: 0;
}
</style>
