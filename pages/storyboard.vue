<template>
  <section class="section">
    <div class="story-menu">
      <b-button @click="expand">Expand All</b-button>
    </div>

    <div class="columns">
      <StoryFrame
        v-for="condition in conditions"
        :key="condition.name"
        :condition="condition"
        :spec="spec"
      />

      <!--
      <StoryFrame

        v-for="(sceneFrame, index) in scenesTree"
        :key="`${index}_${sceneFrame.length}`"
        :frame="sceneFrame"
        :master="isExpanded"
      />
      -->
    </div>
  </section>
</template>

<script>
import isEqual from "lodash/isEqual";

import StoryFrame from "~/components/StoryFrame";

export default {
  name: "StoryBoard",
  components: { StoryFrame },
  data() {
    let isExpanded = false;

    return { isExpanded };
  },
  methods: {
    expand() {
      this.isExpanded = !this.isExpanded;
    }
  },
  async asyncData({ params, $axios }) {
    //TODO: make this a global state
    const spec = await (() =>
      import(`~/data/spec.json`).then(m => m.default || m))();

    let conditions = await $axios.$get("/expirement.json");

    /*
    const baseIndex = conditions.reduce(
      (p, c, i, a) => (a[p].length > c.length ? p : i),
      0
    );

    const scenesTree = conditions[baseIndex].scenes.map((scene, idx) => {
      let sceneBranch = conditions
        .map(condition =>
          idx != baseIndex &&
          condition.scenes[idx] &&
          !isEqual(condition.scenes[idx], scene)
            ? {
                conditionName: condition.name,
                sceneName: condition.scenes[idx].name,
                props: (({ name, ...props }) => props)(condition.scenes[idx])
              }
            : false
        )

      return {
        baseIndex: midIndex,
        isEven: isEven,
        scenes: sceneBranch
      };
    });
    */

    return { spec, conditions };
  },
  head() {
    return {
      title: `PleaBargain | StoryBoard`,
      meta: [
        {
          hid: "description",
          name: "description",
          content: "The StoryBoard Timeline"
        }
      ]
    };
  }
};
</script>

<style scoped>
.story-menu {
  margin-bottom: 1.5rem;
}
</style>
