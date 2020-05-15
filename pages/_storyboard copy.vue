<template>
  <section class="section">
    <div class="box">
      <div class="columns">
        <StoryFrame
          v-for="scene in baseCondition.scenes"
          :key="`${baseCondition.name}_${scene.name}`"
          :conditions="[baseCondition, ...conditions]"
        />
      </div>
    </div>
  </section>
</template>

<script>
import isEqual from "lodash/isEqual";

import StoryFrame from "~/components/StoryFrame";

export default {
  name: "StoryBoard",
  components: { StoryFrame },
  async asyncData({ $axios }) {
    let conditions = await $axios.$get("/expirement.json");

    const baseCondition = conditions.splice(
      conditions.reduce((p, c, i, a) => (a[p].length > c.length ? p : i), 0)
    )[0];

    let test = conditions.map(({ scenes, ...condition }) => {
      const newScenes = scenes.map((scene, idx) =>
        !isEqual(scene, baseCondition.scenes[idx]) ? scene : false
      );

      return { ...condition, newScenes };
    });

    return { baseCondition, conditions };
  },
  head() {
    return {
      title: `PleaBargain | ${this.title}`,
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
