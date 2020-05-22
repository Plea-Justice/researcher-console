<template>
  <div>
    <b-field>
      <b-radio-button
        class="is-capitalized"
        v-for="key in Object.keys(spec.sceneTypes)"
        :key="key"
        :native-value="key"
        v-model="selectedType"
      >{{ key }}</b-radio-button>
    </b-field>

    <!-- Debug: formData output
      <p v-for="{ key, value } in formData" :key="key">{{ `${key}: ${value}` }}</p>
    -->

    <form @submit.prevent="onSubmit">
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

        <!-- FIXME: have selector use asset instead of asset.value to bind reference? -->
        <textarea
          v-if="asset.type == 'text'"
          v-model="asset.value"
          class="textarea has-fixed-size"
          placeholder="script"
        />

        <!-- FIXME: rename to buttons to be more specific? -->
        <ButtonInput v-if="asset.type == 'logical'" v-model="asset.value" />

        <!-- TODO: Display incorrect types/types that don't match anything -->
      </b-field>

      <b-button tag="input" native-type="submit" type="is-primary" value="Save" />
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
    }
  },
  data() {
    // FIXME: Resolve for what will happen on re-render, use computed values?
    //        Pass hidden prop into formData rather than unload whole component?

    const sceneType = this.assets["type"];
    const validSceneTypes = Object.keys(this.spec.sceneTypes);
    // Defaults Scene type selection toggle to the first one that is defines in ~/data/spec.json
    // FIXME: make this a computed value
    // TODO: pull object types out instead?
    const selectedType =
      sceneType && validSceneTypes.includes(sceneType)
        ? sceneType
        : validSceneTypes[0];

    // TODO: add name as an excluded type and update this elsewhere so it is consistent
    // TODO: make props compatible with array or single values
    const formData = Object.entries(this.spec.scene).map(
      ([key, value], index) => ({
        index: index,
        key: key,
        type: value,
        //valid: this.spec.sceneTypes[selectedType].includes(key),
        value: this.assets[key] != "None" ? this.assets[key] : null
      })
    );

    return { selectedType, formData };
  },
  methods: {
    onSubmit() {
      console.log("Form Submitted");
    }
  }
};
</script>
