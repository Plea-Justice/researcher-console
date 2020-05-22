<template>
  <b-select
    v-if="assetsExists"
    @input="$emit('input', value)"
    :placeholder="placeholder"
    v-model="value"
    :icon="icon"
  >
    <!-- fix me don't release value on emit, release something else, $event.target.value? -->

    <!-- TODO: can key just be index, would this be safe after new assets are added? -->
    <!-- FIXME: handle when preset (given from expirements.json) doesn't exists in available files (manifest) -->

    <option v-for="file in getPaths(assetType)" :key="file" :value="file">{{ file }}</option>
  </b-select>
  <p v-else>Oops... no files for "{{ assetType }}" exists</p>
</template>

<script>
export default {
  props: {
    value: {},
    assetType: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      required: false
    },
    icon: {
      type: String,
      required: false
    },
    manifest: {
      type: Object,
      required: true
    }
  },
  computed: {
    assetsExists() {
      const assets = this.manifest[this.assetType + "s"];
      return assets != undefined && assets != [];
    }
  },
  methods: {
    getPaths(assetName) {
      return this.manifest[assetName + "s"];
    }
  }
};
</script>
