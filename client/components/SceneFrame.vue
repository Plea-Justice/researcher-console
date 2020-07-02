<template>
  <div class="frame-wrapper">
    <div class="frame box" :style="numColumns">
      <!-- Sidebar -->
      <aside class="sidebar buttons">
        <!-- Collapse Button -->
        <!-- FIXME: if all scenes blank don't allow collapsing -->
        <b-button
          @click="collapse()"
          :icon-left="`chevron-${isCollapsed ? 'down' : 'up'}`"
          size="is-medium"
        />

        <!-- Frame up/down buttons -->
        <b-button
          v-if="!isFirst && !isCollapsed"
          @click="moveUp()"
          type="is-text"
          size="is-large"
          icon-left="chevron-up"
        />
        <b-button
          v-if="!isLast && !isCollapsed"
          @click="moveDown()"
          type="is-text"
          size="is-large"
          icon-left="chevron-down"
        />

        <b-button
          @click="removeFrame(frame.id)"
          type="is-danger"
          icon-left="close"
          size="is-medium"
        />
      </aside>
      <div v-for="scene in getSceneSet" :key="scene.id" class="scene">
        <!-- FIXME: fully move out blank scene handling (Have to adjusts SceneForm) scoped prop vars? -->
        <SceneForm v-if="scene.props != null" :frameCollapsed="isCollapsed" :scene="scene" />

        <ItemCard v-else blank />
      </div>
    </div>

    <div class="frame-footer">
      <b-button @click="addFrame(frame.id)" type="is-light" size="is-medium" icon-left="plus" />
    </div>
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import ItemCard from "~/components/ItemCard";
import SceneForm from "~/components/SceneForm";

export default {
  name: "SceneFrame",
  components: { ItemCard, SceneForm },
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
      sceneSet: "scenario/sceneSet",
      getFrameIndex: "scenario/getFrameIndex"
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
      moveFrameUp: "scenario/moveFrameUp",
      moveFrameDown: "scenario/moveFrameDown",
      addFrame: "scenario/addFrame",
      removeFrame: "scenario/removeFrame"
    }),
    moveUp() {
      this.moveFrameUp(this.frame.id);
      // emit the frameIndex that must be traveled to
      // FIXME: this.$nextTick this
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

.frame-wrapper {
  display: flex;
  flex-direction: column;
  width: max-content;
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
