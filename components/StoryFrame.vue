<template>
  <!-- TODO: investigate .is-desktop attribute for columns -->
  <div class="columns">
    <b-button @click="expand" :icon-left="`chevron-${isExpanded ? 'up' : 'down'}`"></b-button>

    <StoryCard
      v-for="(scene, index) in frame.scenes"
      :key="`frame_${frame.frameIndex}_condition_${index}`"
      :title="`${scene.name}`"
      :assets="(({ name, ...scene }) => scene)(scene)"
      :frameExpanded="isExpanded"
      :spec="spec"
    />
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
