<template>
  <section class="section">
    <div class="columns box relative-box">
      <div :style="numColumns" class="box absolute-box" />
      <!-- Sidebar -->
      <aside class="column is-1">
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
            @click="moveFrameDown(frame.index)"
            type="is-text"
            size="is-large"
            icon-right="chevron-down"
            class="move-button"
          />
        </div>

        <p>{{ frame.index }}</p>
      </aside>

      <!-- Condition Columns -->
      <div class="column is-11 tile is-ancestor">
        <!-- FIXME: handle keys more reliably, use Unique ID? -->
        <div
          v-for="scene in frame.scenes"
          :key="
            `frame_${scene.index.frame}_condition_${scene.index.scene}_${
              scene.props ? scene.props.name : `blank_${scene.id}`
            }`"
          class="tile is-parent is-4 is-relative min-scene-size"
        >
          <!-- If a blank scene occurs -->
          <StoryCard
            v-if="scene.props == null"
            :frameCollapsed="isCollapsed"
            :isFirst="isFirst"
            isBlank="true"
          >
            <div class="center-wrapper">
              <b-button v-if="isFirst" type="is-light" icon-left="plus" size="is-large" />
            </div>
          </StoryCard>

          <StoryScene
            v-if="scene.props != null"
            :frameCollapsed="isCollapsed"
            :scene="scene"
            :spec="spec"
            :manifest="manifest"
          />

          <b-button
            v-if="scene.props != null"
            @click="addScene({ index: scene.index, scene: spec.scene })"
            type="is-light"
            icon-left="plus"
            size="is-medium"
            class="absolute-button"
          />
        </div>
      </div>
    </div>
  </section>
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
      conditionNames: "scenes/conditionNames",
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
      return { "--num-columns": this.frame.scenes.length - 3 };
    }
  },
  methods: {
    collapse() {
      this.selfCollapsed = !this.selfCollapsed;
    },
    ...mapActions({
      moveFrameUp: "scenes/moveFrameUp",
      moveFrameDown: "scenes/moveFrameDown",
      addScene: "scenes/addScene",
      removeCondition: "scenes/removeCondition"
    })
  }
};
</script>

<style scoped>
.relative-box {
  position: relative;
  /* Ghost visuals */
  border: none;
  box-shadow: none;
}

.absolute-box {
  position: absolute;
  margin-left: -1.25rem;
  margin-top: -1.25rem;
  height: 100%;
  width: calc(100% + 100% * var(--num-columns) * (11 / 12) * (4 / 12));
  /* calc(100% + 100% * (11 / 12) * (4 / 12)) */
}

.min-scene-size {
  min-width: 300px;
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

.absolute-title {
  display: flex;
  justify-content: center;
  align-items: baseline;
  width: 100%;
  position: absolute;
  /* z-index: 1; */
  bottom: 100%;
  /* left: 50%;
  transform: translateX(-50%); */
  margin-bottom: 2.5rem;
}

.close-button {
  color: red;
  padding: 0.5rem;
}

.close-button:hover {
  color: red;
}

.absolute-button {
  position: absolute;
  z-index: 1;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 2rem;
}

.center-wrapper {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
