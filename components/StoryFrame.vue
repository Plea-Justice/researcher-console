<template>
  <div class="column">
    <div class="rows" v-if="master">
      <StoryCard
        class="row"
        v-for="scene in frame.scenes"
        :key="`${scene.conditionName}_${scene.sceneName}`"
        :title="`${scene.conditionName} ${scene.sceneName}`"
        :icon="(({ name, ...scene }) => scene)(scene.props)"
      />
    </div>
    <div class="rows" v-else>
      <StoryCard
        class="row"
        :title="
          (scene => `${scene.conditionName} ${scene.sceneName}`)(getBaseScene())
        "
        :icon="(({ name, ...scene }) => scene)(getBaseScene().props)"
      />
    </div>
    <button @click="expand">Expand</button>
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
    master: {
      type: Boolean,
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
