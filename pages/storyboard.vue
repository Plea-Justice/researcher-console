<template>
  <section class="section">
    <div class="story-menu">
      <b-button @click="expand">{{ `${isExpanded ? "Collapse" : "Expand"} All` }}</b-button>
    </div>

    <div class="columns">
      <div class="column" v-for="{ name } in conditions" :key="name">
        <h1>{{name}}</h1>
      </div>
    </div>

    <StoryFrame
      v-for="(frame, index) in arr"
      :key="`frame_${index}`"
      :frame="frame"
      :allExpanded="isExpanded"
      :spec="spec"
      :manifest="manifest"
    />
  </section>
</template>

<script>
import StoryFrame from "~/components/StoryFrame";

export default {
  name: "StoryBoard",
  components: { StoryFrame },
  data() {
    const isExpanded = true;

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
      import(`~/assets/spec.json`).then(m => m.default || m))();

    const conditions = await $axios.$get("/expirement.json");

    //TODO: clean this so map isn't needed and reduces directly
    const maxColLength = conditions
      .map(condition => condition.scenes.length)
      .reduce((a, b) => Math.max(a, b));

    let arr = [];
    for (let i = 0; i < maxColLength; i++) {
      let arr2 = [];
      for (let j = 0; j < conditions.length; j++) {
        if (conditions[j].scenes[i]) {
          arr2.push(conditions[j].scenes[i]);
        }
      }
      arr.push({ frameIndex: i, scenes: arr2 });
    }

    const manifest = await $axios.$get("/manifest.json");
    /*const length = conditions.reduce((a, b) =>
      console.log({ scene: a.scenes + b.scenes })
    );*/

    /*
    const baseIndex = conditions.reduce(
      (p, c, i, a) => (a[p].length > c.length ? p : i),
      0
    );*/

    return { spec, conditions, arr, manifest };
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
