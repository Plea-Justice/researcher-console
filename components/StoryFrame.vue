<template>
  <div class="frame is-relative" :style="numColumns">
    <div ref="frameBox" class="box absolute-box" />
    <!-- Sidebar -->
    <aside class="sidebar">
      <!-- FIXME: move this to frame child -->
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
        <b-button
          v-if="!isFirst && !isCollapsed"
          @click="moveUp()"
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
    <div v-for="scene in getSceneSet" :key="scene.id" class="scene">
      <!-- FIXME: fully move out blank scene handling (Have to adjusts StoryScene) scoped prop vars? -->

      <StoryScene
        v-if="scene.props != null"
        :frameCollapsed="isCollapsed"
        :scene="scene"
        :id="{ frame: frame.id, scene: scene.id }"
        :isFirst="isFirst"
        :isLast="isLast"
      />

      <StoryCard v-else :frameCollapsed="isCollapsed" />

      <!--<StoryScene :frameCollapsed="isCollapsed" :scene="scene" />-->

      <div class="add-button">
        <b-button
          v-if="scene.props != null"
          @click="addScene({ scene: scene.id, frame: frame.id })"
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
    isFirst: {
      type: Boolean,
      required: false,
      default: false
    },
    isLast: {
      type: Boolean,
      required: false,
      default: false
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
    numColumns() {
      return { "--num-columns": this.frame.scenes.length };
    },
    ...mapGetters({
      sceneSet: "scenes/sceneSet",
      getFrameIndex: "scenes/getFrameIndex"
    }),
    getSceneSet() {
      return this.sceneSet(this.frame.id);
    },
    frameIndex() {
      return this.getFrameIndex(this.frame.id);
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
    moveUp() {
      this.moveFrameUp(this.frame.id);
      // emit the frameIndex that must be traveled to
      this.$emit("scroll-to", this.frameIndex);
    },
    moveDown() {
      this.moveFrameDown(this.frame.id);
      // emit the frameIndex that must be traveled to
      this.$emit("scroll-to", this.frameIndex);
    }
  }
};
</script>

<style lang="scss" scoped>
$frame-box-padding: 1.25rem;
$add-button-height: 105px;

.frame {
  display: flex;
  padding-top: calc(#{$frame-box-padding} + 1px);
  max-width: max-content;
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

.add-button {
  display: flex;
  align-items: center;
  flex-grow: 0;
  /* FIXME: make button height a variable */
  height: $add-button-height;
  padding-top: $frame-box-padding;
}

.absolute-box {
  position: absolute;
  margin-left: -$frame-box-padding;
  margin-top: -$frame-box-padding;
  /* FIXME: make box padding a variable */
  height: calc(100% - #{$add-button-height} + #{$frame-box-padding});
  width: calc(100% - #{$frame-box-padding} * 2);
  margin-bottom: 0;
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
