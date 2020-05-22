<template>
  <div class="column">
    <div class="card has-radius-large">
      <header class="card-header has-top-radius-large">
        <!-- TODO: regex title -->
        <small class="card-header-title has-text-grey">{{ title }}</small>
        <span class="card-header-icon">
          <b-button @click="expand" :icon-left="`chevron-${isExpanded ? 'up' : 'down'}`"></b-button>
        </span>
      </header>

      <div v-if="isExpanded" class="card-content">
        <SceneForm :assets="assets" :spec="spec" :manifest="manifest" />
      </div>
    </div>
  </div>
</template>

<script>
import SceneForm from "~/components/SceneForm";

export default {
  name: "StoryCard",
  components: { SceneForm },
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
      type: Object,
      required: true
    },
    manifest: {
      type: Object,
      required: true
    }
  },
  computed: {
    isExpanded: {
      get: function() {
        return this.frameExpanded;
      },
      set: function(newValue) {
        this.frameExpanded = newValue;
      }
    }
  },
  methods: {
    expand() {
      this.isExpanded = !this.isExpanded;
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
/* TODO: Use calculated value, based on max number of conditions visible defined by a media query */
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
