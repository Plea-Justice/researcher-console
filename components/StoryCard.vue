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
        // TODO: make compatible with an array or single single prop
        -->

        <b-field>
          <b-radio-button
            class="is-capitalized"
            v-for="key in Object.keys(spec.sceneTypes)"
            :key="key"
            :native-value="key"
            v-model="selectedType"
            >{{ key }}</b-radio-button
          >
        </b-field>

        <form>
          <b-field
            v-for="[key, value] in getSceneProps(selectedType)"
            :key="key"
          >
            <b-input
              v-if="key != 'name' && value == 'string'"
              :placeholder="key"
            />

            <b-select
              v-if="value == 'image'"
              :placeholder="key"
              icon="wallpaper"
            >
              <option value="1">Test</option>
            </b-select>

            <b-select
              v-if="value == 'video'"
              :placeholder="key"
              icon="movie_creation"
            >
              <option value="1">Test</option>
            </b-select>

            <textarea
              v-if="value == 'text'"
              class="textarea has-fixed-size"
              placeholder="Script"
            />

            <div v-if="value == 'logical'">
              <b-button>Example Button</b-button>
            </div>
          </b-field>
        </form>
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
    },
    spec: {
      tupe: Object,
      required: true
    }
  },
  data() {
    //TODO: handle this
    // Build key list
    const sceneAssets = Object.keys(this.icon).filter(
      key => this.icon[key] != "None"
    );

    // --- Internal States ---

    // Defaults Scene type selection toggle to the first one that is defines in ~/data/spec.json
    const selectedType = Object.keys(this.spec.sceneTypes)[0];

    return { sceneAssets, selectedType };
  },
  methods: {
    getSceneProps(sceneType) {
      //TODO: add handling for None and Erroneous types
      return Object.values(this.spec.sceneTypes[sceneType]).map(key => [
        key,
        this.spec.scene[key]
      ]);
    },

    async getAsset(assetName) {
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
.row {
  margin-bottom: 1.5rem;
}

.card {
  min-height: 225px;
  border-radius: 10px;
}

.toggle-button {
  text-transform: capitalize;
}
</style>
