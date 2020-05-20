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

    <!--
      <p v-for="{ key, value } in formData" :key="key">{{ `${key}: ${value}` }}</p>
    -->

    <form>
      <b-field v-for="asset in validFields" :key="asset.key">
        <b-input
          v-if="asset.key != 'name' && asset.type == 'string'"
          :placeholder="asset.key"
          v-model="formData[asset.index].value"
        />

        <b-select
          v-if="asset.type == 'image'"
          :placeholder="asset.key"
          v-model="asset.value"
          icon="wallpaper"
        >
          <option value="1">Test</option>
        </b-select>

        <b-select
          v-if="asset.type == 'video'"
          :placeholder="asset.key"
          v-model="asset.value"
          icon="movie_creation"
        >
          <option value="1">Test</option>
        </b-select>

        <textarea
          v-if="asset.type == 'text'"
          v-model="asset.value"
          class="textarea has-fixed-size"
          placeholder="script"
        />

        <div v-if="asset.type == 'logical'" :v-model="asset.value">
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
</template>

<script>
export default {
  name: "SceneForm",
  props: {
    assets: {
      type: Object,
      required: true
    },
    spec: {
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

    // Defaults Scene type selection toggle to the first one that is defines in ~/data/spec.json
    const selectedType = Object.keys(this.spec.sceneTypes)[0];

    // TODO: add name as an excluded type and update this elsewhere so it is consistent
    // TODO: make props compatible with array or single values
    const formData = Object.entries(this.spec.scene).map(
      ([key, value], index) => ({
        index: index,
        key: key,
        type: value,
        //valid: this.spec.sceneTypes[selectedType].includes(key),
        value: ""
      })
    );

    return { selectedType, formData };
  }
};
</script>

<style>
</style>
