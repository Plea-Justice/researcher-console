<template>
  <section class="section">
    <b-button @click="expand">Expand All</b-button>
    <div class="columns">
      <StoryFrame
        v-for="(sceneFrame, index) in scenesTree"
        :key="`${index}_${sceneFrame.length}`"
        :frame="sceneFrame"
        :master="isExpanded"
      />
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
  async asyncData({ $axios }) {
    let conditions = await $axios.$get("/expirement.json");

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
        .filter(e => e);

      //TODO: define this layout as a struct os object or something so it's more repeatable?

      const baseScene = {
        conditionName: conditions[baseIndex].name,
        sceneName: scene.name,
        props: (({ name, ...props }) => props)(scene)
      };
      const branchLen = sceneBranch.length;
      const isEven = branchLen % 2 === 0;
      let midIndex = 0;
      if (!branchLen) {
        //if isEmpty or === 1
        sceneBranch = [...sceneBranch, baseScene];
      } else {
        // index if Even else if Odd
        midIndex = isEven ? branchLen / 2 : (branchLen + 1) / 2;

        sceneBranch = [
          ...sceneBranch.slice(0, midIndex),
          baseScene,
          ...sceneBranch.slice(midIndex)
        ];
      }

      return {
        baseIndex: midIndex,
        isEven: isEven,
        scenes: sceneBranch
      };
    });

    return { scenesTree };
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
