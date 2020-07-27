<template>
  <div class="frame-wrapper">
    <div class="frame box">
      <!-- Sidebar -->
      <aside class="sidebar buttons">
        <template v-if="!(isFirst && isLast && frame.blank)">
          <!-- Collapse Button -->
          <b-button
            v-show="!frame.blank"
            @click="collapseFrame()"
            :icon-left="`chevron-${frame.collapsed ? 'down' : 'up'}`"
            type="is-text"
            size="is-medium"
          />

          <!-- Move Up/Down Buttons -->
          <template v-show="!frame.collapsed">
            <b-button
              v-show="!isFirst"
              @click="moveUp()"
              type="is-light"
              size="is-medium"
              icon-left="arrow-up"
            />
            <b-button
              v-show="!isLast"
              @click="moveDown()"
              type="is-light"
              size="is-medium"
              icon-left="arrow-down"
            />
          </template>

          <!-- Remove Frame Button -->
          <b-button
            @click="removeFrameHelper(frame.id)"
            type="is-danger"
            icon-left="close"
            size="is-medium"
          />
        </template>
      </aside>

      <div v-for="(scene, index) in getSceneSet" :key="scene.id" class="scene">
        <Scene
          :ref="`scene_${scene.id}`"
          v-if="scene.props !== null"
          @selected="$emit('selected', $event)"
          :scene="scene"
          :collapsed="!!frame.collapsed"
          :selectable="selectable"
        />
        <!-- FIXME: Remove '!!' from !!frame.collapsed -->

        <GenericCard v-else blank>
          <b-button
            @click="addSceneHelper(index, scene.id)"
            type="is-light"
            size="is-medium"
            icon-left="plus"
          />
        </GenericCard>
      </div>
    </div>

    <div class="frame-footer">
      <b-button
        v-show="!(isFirst && isLast && frame.blank)"
        @click="addFrameHelper(frame.id)"
        type="is-light"
        size="is-medium"
        icon-left="plus"
      />
    </div>
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import GenericCard from "~/components/cards/GenericCard";
import Scene from "~/components/Scene";

export default {
  name: "SceneFrame",
  components: { Scene, GenericCard },
  props: {
    frame: {
      type: Object,
      required: true
    },
    frameIndex: {
      type: Number,
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
    },
    selectable: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    ...mapGetters({
      sceneSet: "scenario/sceneSet"
    }),
    getSceneSet() {
      return this.sceneSet(this.frame.id);
    }
  },
  methods: {
    ...mapActions({
      moveFrameUp: "scenario/moveFrameUp",
      moveFrameDown: "scenario/moveFrameDown",
      addFrame: "scenario/addFrame",
      removeFrame: "scenario/removeFrame",
      addScene: "scenario/addScene",
      updateFrame: "scenario/updateFrame"
    }),
    collapseFrame() {
      //FIXME: rename to updateFrameKey
      this.updateFrame({
        id: this.frame.id,
        key: "collapsed",
        val: !this.frame.collapsed
      });
    },
    moveUp() {
      this.moveFrameUp(this.frame.id);
      // emit the frameIndex that must be traveled to
      this.$emit("scroll-to", { frameIndex: this.frameIndex - 1 });
    },
    moveDown() {
      this.moveFrameDown(this.frame.id);
      this.$emit("scroll-to", { frameIndex: this.frameIndex + 1 });
    },
    addFrameHelper(frameId) {
      this.addFrame(frameId);
      this.$emit("scroll-to", { frameIndex: this.frameIndex + 1 });
    },
    removeFrameHelper(frameId) {
      this.removeFrame(frameId);
      // Make this a not smooth scroll, just want to re-allign frame
      this.$emit("scroll-to", { frameIndex: this.frameIndex, smooth: false });
    },
    addSceneHelper(sceneIndex, sceneId) {
      this.addScene(sceneId);
      this.$nextTick(() => this.$refs[`scene_${sceneId}`][0].focus());
    }
  }
};
</script>

<style lang="scss" scoped>
// This is the default Bulma .box padding

.frame-wrapper {
  display: flex;
  flex-direction: column;
  width: max-content;
  position: relative;
}

.box {
  padding: $framePadding;
}

.frame {
  display: flex;
  height: max-content;
  width: min-content;
  // Fix box model for box-shadow
  margin-top: 1px;
  // Remove bottom margin from box (leave 1px for box model)
  margin-bottom: 1px;

  // Everything except last child & > :not(:last-child)
  & > div:nth-last-of-type(n + 2) {
    margin-right: $frameSceneGap;
  }
}

.frame-footer {
  display: flex;
  justify-content: center;
  margin-top: $framePadding;
  margin-bottom: $framePadding;
}

.sidebar {
  display: flex;
  flex-direction: column;
  flex-basis: $frameSideBarBasis;
  margin-right: $frameSideBarMargin;
  // Get rid of margin-bottom creating whitespace
  margin-bottom: 0;

  // IMPORTANT: Margins need !important to properly overwrite Buefy button margins
  & > :first-child {
    // scene-header-input-font-size-difference (1.25 - 1) + ...
    margin: ((0.25rem + $cardHeadFootPadding) / 2) 0 10px !important;
  }

  // Everything except first & last child
  & > :nth-child(n + 2):nth-last-child(n + 2) {
    margin: 0 0 10px !important;
  }

  & > :last-child {
    // scene-close-button-font-size-difference (1.25 - 1) + ...
    margin: auto 0 ((0.25rem + $cardHeadFootPadding) / 2) !important;
  }
}

.scene {
  display: flex;
  width: $sceneWidth;
}
</style>
