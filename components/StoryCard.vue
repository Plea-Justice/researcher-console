<template>
  <div class="column">
    <div class="card has-radius-large">
      <header class="card-header has-top-radius-large">
        <!-- TODO: regex title -->
        <small class="card-header-title has-text-grey">{{ title }}</small>
        <span class="card-header-icon">
          <b-button @click="expand">{{ isExpanded ? "-" : "+" }}</b-button>
        </span>
      </header>

      <div v-if="isExpanded" class="card-content">
        <!--FIXME: add the condition and scene name to every key-->

        <p>{{ formData }}</p>
        <!--<p v-for="(id, index) in formData" :key="index">{{ id[index] }}</p>-->

        <!-- TODO: make props compatible with array or single values -->
        <b-field>
          <b-radio-button
            class="is-capitalized"
            v-for="key in Object.keys(spec.sceneTypes)"
            :key="key"
            :native-value="key"
            v-model="selectedType"
          >{{ key }}</b-radio-button>
        </b-field>

        <form>
          <b-field v-for="[key, value, index] in getSceneAttributes(selectedType)" :key="key">
            <b-input
              v-if="key != 'name' && value == 'string'"
              :placeholder="key"
              :v-model="formData[index]"
            />

            <b-select
              v-if="value == 'image'"
              :placeholder="key"
              :v-model="formData[index]"
              icon="wallpaper"
            >
              <option value="1">Test</option>
            </b-select>

            <b-select
              v-if="value == 'video'"
              :placeholder="key"
              :v-model="formData[index]"
              icon="movie_creation"
            >
              <option value="1">Test</option>
            </b-select>

            <textarea
              v-if="value == 'text'"
              :v-model="formData[index]"
              class="textarea has-fixed-size"
              placeholder="script"
            />

            <div v-if="value == 'logical'" :v-model="formData[index]">
              <h3>Buttons</h3>

              <p v-if="!assets.buttons">No buttons addded</p>

              <div class="buttons">
                <b-button v-for="button in assets.buttons" :key="`${button}-button`">{{ button }}</b-button>
              </div>
              <b-button type="is-primary">Add Button</b-button>
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
    assets: {
      type: Object,
      required: true
    },
    frameExpanded: {
      type: Boolean,
      required: true
    },
    spec: {
      tupe: Object,
      required: true
    }
  },
  computed: {
    isExpanded: {
      get() {
        return this.frameExpanded;
      },
      set(newValue) {
        this.frameExpanded = newValue;
      }
    }
  },
  data() {
    //TODO: handle this
    // Build key list
    const sceneAssets = Object.keys(this.assets).filter(
      key => this.assets[key] != "None"
    );

    // --- Internal States ---

    // Defaults Scene type selection toggle to the first one that is defines in ~/data/spec.json
    const selectedType = Object.keys(this.spec.sceneTypes)[0];
    let formData = [];

    return { sceneAssets, selectedType, formData };
  },
  methods: {
    expand() {
      this.isExpanded = !this.isExpanded;
    },

    getSceneAttributes(sceneType) {
      //TODO: add handling for None and Erroneous types
      // TODO: fix this up, just loop the whole thing once?

      //const index = spec.scene.some(asset => asset == "actor");
      return Object.values(this.spec.sceneTypes[sceneType]).map(
        (key, index) => [
          key,
          this.spec.scene[key],
          Object.keys(this.spec.scene).findIndex(function(asset) {
            return asset == key;
          })
        ]
      );
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
/* TODO: set horizontal styling column properties */
/*.column {
  flex-basis: 20%;
  flex-grow: 0;
}*/

/* FIXME: use Bulma SASS $radius-large variable */
.has-radius-large {
  border-radius: 6px;
}

.has-top-radius-large {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.card-header-button {
  align-self: center;
}

.toggle-button {
  text-transform: capitalize;
}

.buttons {
  justify-content: center;
}
</style>
