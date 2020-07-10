<template>
  <div class="frame-wrapper">
    <div class="frame box">
      <div :class="{ 'selection-wrapper': selection }" />
      <!-- Sidebar -->
      <aside class="sidebar">
        <div v-show="!(isFirst && isLast && frame.blank)" class="buttons">
          <!-- Collapse Button -->
          <b-button
            v-show="!frame.blank"
            @click="collapseFrame()"
            :icon-left="`chevron-${frame.collapsed ? 'down' : 'up'}`"
            size="is-medium"
          />

          <!-- Move Up/Down Buttons -->
          <template v-show="!frame.collapsed">
            <b-button
              v-show="!isFirst"
              @click="moveUp()"
              type="is-text"
              size="is-large"
              icon-left="chevron-up"
            />
            <b-button
              v-show="!isLast"
              @click="moveDown()"
              type="is-text"
              size="is-large"
              icon-left="chevron-down"
            />
          </template>

          <!-- Remove Frame Button -->
          <b-button
            @click="removeFrame(frame.id)"
            type="is-danger"
            icon-left="close"
            size="is-medium"
          />
        </div>
      </aside>
      <div v-for="(scene, index) in getSceneSet" :key="scene.id" class="scene">
        <Scene
          :ref="`scene_${scene.id}`"
          v-if="scene.props !== null"
          :scene="scene"
          :collapsed="!!frame.collapsed"
        />
        <!-- Remove '!!' from !!frame.collapsed -->

        <GenericCard v-else focused>
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
        @click="addFrame(frame.id)"
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
import Scene from "~/components/scene/Scene";

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
    selection: {
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
      this.updateFrame({
        id: this.frame.id,
        key: "collapsed",
        val: !this.frame.collapsed
      });
    },
    moveUp() {
      this.moveFrameUp(this.frame.id);
      // emit the frameIndex that must be traveled to
      this.$emit("scroll-to", this.frameIndex - 1);
    },
    moveDown() {
      this.moveFrameDown(this.frame.id);
      // emit the frameIndex that must be traveled to
      this.$emit("scroll-to", this.frameIndex + 1);
    },
    addSceneHelper(sceneIndex, sceneId) {
      this.addScene(sceneId);
      this.$nextTick(() => this.$refs[`scene_${sceneId}`][0].focus());
    }
  }
};
</script>

<style lang="scss" scoped>
$frame-box-padding: 1.25rem;
$add-button-height: 105px;

.frame-wrapper {
  display: flex;
  flex-direction: column;
  width: max-content;
  position: relative;
}

.selection-wrapper {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 5;
  cursor: pointer;

  &:hover {
    background-color: #007aff50;
  }

  &:active {
    background-color: #0a84ff64;
  }
}

.frame {
  display: flex;
  height: max-content;
  width: min-content;
  /* Remove excessive right-padding */
  padding-right: 0;
  /* fix box model for box-shadow */
  margin-top: 1px;
  /* remove bottom margin from box */
  margin-bottom: 0;
}

.frame-footer {
  display: flex;
  justify-content: center;
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
}

.sidebar {
  flex-direction: column;
  flex-basis: 60px;
  margin-right: 15px;
  /* Get rid of margin-bottom creating needed whitespace */
  margin-bottom: 0;
}

.scene {
  display: flex;
  margin-right: 30px;
  width: 350px;
}

.sidebar {
  & > :first-child {
    margin: 0 0 10px 0 !important;
  }

  & > :nth-child(n + 2):nth-last-child(n + 2) {
    margin: 0 0 10px 0 !important;
  }

  & > :last-child {
    margin: auto 0 0 !important;
  }
}
</style>
