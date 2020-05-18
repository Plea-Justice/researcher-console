<template>
  <div class="column">
    <div class="rows">
      <StoryCard
        v-for="(scene, index) in condition.scenes"
        :key="`${condition.name}_${scene.name}_${index}`"
        :title="`${condition.name} ${scene.name}`"
        :icon="(({ name, ...scene }) => scene)(scene)"
        :spec="spec"
      />
    </div>
  </div>

  <!--<button @click="expand">Expand</button>-->
</template>

<script>
import StoryCard from "~/components/StoryCard";

export default {
  name: "StoryFrame",
  components: { StoryCard },
  props: {
    condition: {
      type: Object,
      required: true
    },
    spec: {
      type: Object,
      required: true
    }
  },
  methods: {
    getBaseScene() {
      return this.frame.scenes[this.frame.baseIndex];
    },
    expand() {
      this.master = !this.master;
    }
  }
};
</script>

<style scoped>
.column {
  flex-basis: 20%;
  flex-grow: 0;
}
</style>
