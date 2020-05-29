<template>
  <!-- FIXME: create and use isFirst, isLast helper functions -->

  <div class="section">
    <div class="box columns">
      <!-- Sidebar -->
      <aside class="column is-1">
        <div class="buttons">
          <!-- Collapse Button -->
          <b-button
            @click="expand()"
            :icon-left="`chevron-${isExpanded ? 'up' : 'down'}`"
            size="is-medium"
            class="space-left"
            :class="{ 'space-bottom': isExpanded, 'no-space-bottom': !isExpanded }"
          />

          <!-- Frame up/down buttons -->
          <b-button
            v-if="frame.index != 0 && isExpanded"
            @click="moveFrameUp(frame.index)"
            size="is-large"
            icon-right="chevron-up"
            class="move-button"
          />
          <b-button
            v-if="frame.index != frameSize - 1 && isExpanded"
            @click="moveFrameDown(frame.index)"
            size="is-large"
            icon-right="chevron-down"
            class="move-button"
          />
        </div>
      </aside>

      <!-- Condition Columns -->
      <div class="column is-11 tile is-ancestor">
        <div
          v-for="(scene, index) in frame.scenes"
          :key="`frame_${scene.index.frame}_condition_${scene.index.scene}_${scene.props.name}`"
          class="tile is-parent is-4 is-relative"
        >
          <h1
            v-if="frame.index == 0"
            class="has-text-centered subtitle absolute-title"
          >{{ conditionNames[scene.index.scene] }}</h1>

          <StoryCard :scene="scene" :frameExpanded="isExpanded" :spec="spec" :manifest="manifest" />

          <b-button
            @click="addScene({ index: scene.index, scene: spec.scene })"
            icon-left="plus"
            size="is-medium"
            class="absolute-button"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import StoryCard from "~/components/StoryCard";

export default {
  name: "StoryFrame",
  components: { StoryCard },
  props: {
    frame: {
      type: Object,
      required: true
    },
    allExpanded: {
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
  computed: {
    isExpanded: {
      get() {
        return this.allExpanded;
      },
      set(newValue) {
        return (this.allExpanded = newValue);
      }
    },
    ...mapGetters({
      conditionNames: "scenes/conditionNames",
      frameSize: "scenes/frameSize"
    })
  },
  methods: {
    expand() {
      this.isExpanded = !this.isExpanded;
    },
    ...mapActions({
      moveFrameUp: "scenes/moveFrameUp",
      moveFrameDown: "scenes/moveFrameDown",
      addScene: "scenes/addScene"
    })
  }
};
</script>

<style scoped>
.space-left {
  margin-left: 0.25rem;
}

.space-bottom {
  margin-bottom: 2rem;
}

.no-space-bottom {
  margin-bottom: 0;
}

.absolute-title {
  position: absolute;
  width: 100%;
  /* z-index: 1; */
  bottom: 100%;
  /* left: 50%;
  transform: translateX(-50%); */
  margin-bottom: 2.5rem;
}

.absolute-button {
  position: absolute;
  z-index: 1;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 2rem;
}
</style>
