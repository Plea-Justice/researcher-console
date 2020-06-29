<template>
  <SceneCard :frameCollapsed="frameCollapsed" :id="scene.id">
    <!-- Header -->
    <template v-slot:header>
      <b-input v-model="formData[nameIndex].value" placeholder="name" />
    </template>

    <!-- Body -->
    <template v-slot:default>
      <form @submit.prevent="onSubmit()">
        <!-- Scene Type Toggle -->
        <b-field class="is-capitalized toggle-button">
          <b-radio-button
            v-for="sceneType in validSceneTypes"
            :key="sceneType"
            :native-value="sceneType"
            v-model="selectedType"
          >{{ sceneType }}</b-radio-button>
        </b-field>

        <!-- Main Form -->
        <b-field v-for="asset in validFields" :key="asset.key">
          <FileSelector
            v-if="asset.type == 'image' || asset.type == 'video'"
            v-model="asset.value"
            :fileNames="assetNameByType[asset.key + 's'] || []"
            :placeholder="asset.key"
            :icon="getIcon(asset.type)"
          />

          <textarea
            v-if="asset.type == 'text'"
            v-model="asset.value"
            class="textarea has-fixed-size"
            placeholder="script"
          />

          <ButtonInput v-if="asset.type == 'buttons'" v-model="asset.value" />

          <!-- TODO: Display error for incorrect types/types that don't match anything ? -->
        </b-field>
      </form>
    </template>
  </SceneCard>
</template>

<script>
// Import VueX
import { mapGetters } from "vuex";

// Import Components
import SceneCard from "~/components/SceneCard";
import FileSelector from "~/components/FileSelector";
import ButtonInput from "~/components/ButtonInput";

// FIXME: formalize spec
import spec from "~/assets/spec.json";

export default {
  name: "SceneForm",
  components: { SceneCard, FileSelector, ButtonInput },
  props: {
    frameCollapsed: {
      type: Boolean,
      required: true
    },
    scene: {
      type: Object,
      required: true
    }
  },
  data() {
    const sceneType = this.scene.props["type"];
    const validSceneTypes = Object.keys(spec.sceneTypes);

    // Defaults Scene type selection toggle to the first one if none is defined
    const selectedType =
      sceneType && validSceneTypes.includes(sceneType)
        ? sceneType
        : validSceneTypes[0];

    // TODO: make props compatible with array or single values ?
    const formData = Object.entries(spec.scene).map(([key, type]) => ({
      key,
      type,
      value: this.scene.props[key] != "None" ? this.scene.props[key] : null
    }));

    const nameIndex = formData.findIndex(obj => obj.key == "name");

    return {
      validSceneTypes,
      selectedType,
      formData,
      nameIndex
    };
  },
  computed: {
    validFields() {
      return this.formData.filter(({ key }) =>
        spec.sceneTypes[this.selectedType].includes(key)
      );
    },
    ...mapGetters({
      assetSet: "assets/assetSet"
    }),
    assetNameByType() {
      return this.assetSet.reduce(
        (obj, item) => (
          obj[item.type]
            ? obj[item.type].push(item.name)
            : (obj[item.type] = [item.name]),
          obj
        ),
        {}
      );
    }
  },
  methods: {
    getIcon(fileType) {
      let icon = null;
      if (fileType === "image") {
        ("file-image");
      } else if (fileType === "video") {
        ("file-video");
      }
      return icon;
    },
    onSubmit() {
      console.log("Form Submitted");
    }
  }
};
</script>

<style scoped>
.toggle-button {
  justify-content: center !important;
}
</style>
