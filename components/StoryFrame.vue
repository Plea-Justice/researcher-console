<template>
  <div>
    <div class="box columns">
      <!-- Sidebar -->
      <aside class="column is-1 section">
        <p>{{ frame.frameIndex }}</p>

        <b-button
          @click="expand()"
          :icon-left="`chevron-${isExpanded ? 'up' : 'down'}`"
          size="is-medium"
        />

        <div class="buttons">
          <b-button
            v-if="frameIndex != 0"
            @click="moveFrameUp(frameIndex)"
            size="is-large"
            icon-right="chevron-up"
            class="move-button"
          />
          <b-button
            v-if="frameIndex != frameSize - 1"
            @click="moveFrameDown(frameIndex)"
            size="is-large"
            icon-right="chevron-down"
            class="move-button"
          />
        </div>
      </aside>

      <!-- Columns -->
      <div class="column is-11 tile is-ancestor">
        <div
          v-for="(scene, index) in frame.scenes"
          :key="`frame_${frame.frameIndex}_condition_${scene.name}`"
          class="tile is-parent is-4"
        >
          <StoryCard
            :sceneIndex="{ frameIndex: frameIndex, sceneIndex: index }"
            :title="`${scene.name}`"
            :assets="scene"
            :frameExpanded="isExpanded"
            :spec="spec"
            :manifest="manifest"
          />
        </div>
      </div>
    </div>

    <!-- Just use an index based on length -->
    <b-button
      v-for="(scene, index) in frame.scenes"
      :key="scene.name"
      @click="addScene({frameIndex, sceneIndex: index, scene: spec.scene})"
      icon-left="plus"
      size="is-medium"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import StoryCard from "~/components/StoryCard";

export default {
  name: "StoryFrame",
  components: { StoryCard },
  props: {
    frameIndex: {
      type: Number,
      required: true
    },
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
