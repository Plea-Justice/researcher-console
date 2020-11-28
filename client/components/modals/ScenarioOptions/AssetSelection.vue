<template>
  <Shuttle
    label="Select assets for use in this scenario."
    lhead="Available Assets"
    rhead="Selected for Use"
    keyfield="id"
    textfield="name"
    :options="assetSet"
    :preselected="assetList"
    @selected="assetList = $event"
  />
</template>

<script>
// Import Components
import Shuttle from "~/components/form/Shuttle";

// Import VueX
import { mapGetters, mapActions } from "vuex";

export default {
  components: { Shuttle },
  computed: {
    ...mapGetters({
      assetSet: "assets/assetSet",
      getAssetList: "scenario/assetList",
    }),
    assetList: {
      get: function () {
        return this.getAssetList;
      },
      set: function (newValue) {
        this.updateAssetList({ assetList: newValue });
      },
    },
  },

  methods: {
    ...mapActions({
      updateAssetList: "scenario/updateAssetList",
    }),
  },
};
</script>
