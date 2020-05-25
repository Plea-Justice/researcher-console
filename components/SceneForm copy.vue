<template>
  <div>
    <!-- Scene Type Toggle -->
    <b-field class="toggle-button is-capitalized">
      <b-radio-button
        v-for="key in Object.keys(spec.sceneTypes)"
        :key="key"
        :native-value="key"
        v-model="selectedType"
      >{{ key }}</b-radio-button>
    </b-field>

    <!-- Debug: formData output
      <p v-for="{ key, value } in formData" :key="key">{{ `${key}: ${value}` }}</p>
    -->

    <!-- Main Form -->
    <form @submit.prevent="onSubmit" ref="penis">
      <b-field v-for="asset in validFields" :key="asset.key">
        <FileSelector
          v-if="asset.key != 'name' && asset.type == 'string'"
          :assetType="asset.key"
          :placeholder="asset.key"
          icon="file-image"
          v-model="asset.value"
          :manifest="manifest"
        />

        <FileSelector
          v-if="asset.type == 'image'"
          :assetType="asset.key"
          :placeholder="asset.key"
          icon="file-image"
          v-model="asset.value"
          :manifest="manifest"
        />

        <FileSelector
          v-if="asset.type == 'video'"
          :assetType="asset.key"
          :placeholder="asset.key"
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

        <!-- FIXME: rename to buttons to be more specific? -->
        <ButtonInput v-if="asset.type == 'buttons'" v-model="asset.value" />

        <!-- TODO: Display error for incorrect types/types that don't match anything -->
      </b-field>

      <!--<b-button tag="input" native-type="submit" type="is-primary" value="Save" ref="submit" />-->
      <!-- Add last saved/auto save with button saving animation -->
    </form>
  </div>
</template>

<script>
import FileSelector from "~/components/FileSelector";
import ButtonInput from "~/components/ButtonInput";

export default {
  name: "SceneForm",
  components: { FileSelector, ButtonInput },
  props: {
    assets: {
      type: Object,
      required: true
    },
    name: {
      type: String,
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
    validFields: function() {
      return this.formData.filter(({ key }) =>
        this.spec.sceneTypes[this.selectedType].includes(key)
      );
    },
    sceneName() {
      return this.name;
    }
  },
  data() {
    const sceneType = this.assets["type"];
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
      type: key == "name" ? this.sceneName : value,
      value: this.assets[key] != "None" ? this.assets[key] : null
    }));

    return { selectedType, formData };
  },
  methods: {
    onSubmit() {
      console.log("Form Submitted");
    }
  }
};
</script>

<style>
.toggle-button {
  justify-content: center;
}
</style>
