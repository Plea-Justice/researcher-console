<template>
  <div>
    <b-button @click="expand" :icon-left="`chevron-${isExpanded ? 'up' : 'down'}`"></b-button>

    <div class="tile is-ancestor">
      <div
        v-for="(scene, index) in frame.scenes"
        :key="`frame_${frame.frameIndex}_condition_${index}`"
        class="tile is-parent is-4"
      >
        <StoryCard
          :title="`${scene.name}`"
          :assets="scene"
          :frameExpanded="isExpanded"
          :spec="spec"
          :manifest="manifest"
        />
      </div>
    </div>
  </div>
</template>

<script>
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
    }
  },
  methods: {
    expand() {
      this.isExpanded = !this.isExpanded;
    }
  }
};
</script>
