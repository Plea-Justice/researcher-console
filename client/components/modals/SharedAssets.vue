<template>
  <SharedItems :name="`My Assets: ${`(${sharedAssetSet.length})` || ''}`">
    <Asset
      v-for="asset in sharedAssetSet"
      :key="asset.id"
      :asset="asset"
      :itemType="'Scenario'"
      duplicate
      @duplicate="copyAsset($event)"
    />
  </SharedItems>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Mixins
import User from "~/mixins/User";

// Import Components
import SharedItems from "~/components/modals/SharedItems";
import Asset from "~/components/cards/Asset";

export default {
  components: { SharedItems, Asset },
  mixins: [User],
  computed: {
    ...mapGetters({
      assetSet: "assets/assetSet"
    }),
    sharedAssetSet() {
      return this.assetSet.filter(
        asset => asset.public && asset.owner !== this.user.name
      );
    }
  },
  methods: {
    ...mapActions({
      duplicateAsset: "assets/duplicateAsset"
    }),
    copyAsset(id) {
      console.log("Fired");

      //FIXME: needs check for duplicates
      this.duplicateAsset(id);
    }
  }
};
</script>
