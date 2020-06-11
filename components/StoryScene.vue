<template>
  <StoryCard :frameCollapsed="frameCollapsed" :sceneIndex="scene.index">
    <!-- Header -->
    <template v-slot:header>
      <div class="card-header-title flex-center">
        <b-input v-model="formData[nameIndex].value" placeholder="name" />
      </div>
    </template>

    <!-- Body -->
    <template v-slot:default>
      <form @submit.prevent="onSubmit()">
        <!-- Debug: formData output
          <p v-for="{ key, value } in formData" :key="key">{{ `${key}: ${value}` }}</p>
        -->

        <!-- Scene Type Toggle -->
        <b-field class="is-capitalized toggle-button">
          <b-radio-button
            v-for="key in validSceneTypes"
            :key="key"
            :native-value="key"
            v-model="selectedType"
          >{{ key }}</b-radio-button>
        </b-field>

        <!-- Main Form -->
        <b-field v-for="asset in validFields" :key="asset.key">
          <FileSelector
            v-if="asset.type == 'image'"
            :assetType="asset.key"
            icon="file-image"
            v-model="asset.value"
            :manifest="manifest"
          />

          <FileSelector
            v-if="asset.type == 'video'"
            :assetType="asset.key"
            icon="file-video"
            v-model="asset.value"
            :manifest="manifest"
          />

          <textarea
            v-if="asset.type == 'text'"
            v-model="asset.value"
            class="textarea has-fixed-size"
            placeholder="script"
          />

          <ButtonInput v-if="asset.type == 'buttons'" v-model="asset.value" />

          <!-- TODO: Display error for incorrect types/types that don't match anything -->
        </b-field>
      </form>
    </template>

    <!-- Footer -->
    <template v-slot:footer :sceneIndex="scene.index">
      <!-- Form Submit Button -->
      <b-button tag="input" native-type="submit" type="is-primary" value="Save" />
    </template>
  </StoryCard>
</template>

<script>
// Import Components
import StoryCard from "~/components/StoryCard";
import FileSelector from "~/components/FileSelector";
import ButtonInput from "~/components/ButtonInput";

export default {
  name: "StoryForm",
  components: { StoryCard, FileSelector, ButtonInput },
  props: {
    scene: {
      type: Object,
      required: true
    },
    frameCollapsed: {
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
  data() {
    const sceneType = this.scene.props["type"];
    const validSceneTypes = Object.keys(this.spec.sceneTypes);

    // Defaults Scene type selection toggle to the first one that is defines in ~/data/spec.json
    const selectedType =
      sceneType && validSceneTypes.includes(sceneType)
        ? sceneType
        : validSceneTypes[0];

    // TODO: add name as an excluded type and update this elsewhere so it is consistent
    // TODO: make props compatible with array or single values
    const formData = Object.entries(this.spec.scene).map(([key, value]) => ({
      key: key,
      type: value,
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
        this.spec.sceneTypes[this.selectedType].includes(key)
      );
    }
  },
  methods: {
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

.flex-center {
  display: flex;
  justify-content: center;
}
</style>
