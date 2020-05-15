<template>
  <div class="row">
    <div class="card">
      <header class="card-header">
        <small class="card-header-title has-text-grey">{{ title }}</small>
      </header>
      <div class="card-content has-text-centered">
        <!--
        <div class="content has-text-centered">
          <b-icon
            :icon="icon"
            size="is-large"
            type="is-primary"
          />
        </div>
        -->
        <ul>
          {
          <li v-for="asset in sceneAssets" :key="asset">
            {{ asset }}
          </li>
          }
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "StoryCard",
  props: {
    title: {
      type: String,
      required: true
    },
    icon: {
      type: Object,
      required: true
    }
  },
  data() {
    const sceneAssets = Object.keys(this.icon).filter(
      key => this.icon[key] != "None"
    );

    return { sceneAssets };
  },
  methods: {
    async fetchAsset(assetName) {
      console.log(assetName);
      const { name, ...b } = assetName;
      console.log("a: " + name);
      console.log("b: " + b);

      const asset =
        assetName != "None"
          ? await this.$axios.$get(`/assets/${assetName}`)
          : "Error: asset is 'None' or missing asset field exists";
      return asset;
    }
  }
};
</script>

<style scoped>
.card {
  min-height: 225px;
  border-radius: 10px;
}
</style>
