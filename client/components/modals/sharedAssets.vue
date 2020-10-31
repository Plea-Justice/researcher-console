<template>
  <SharedItems name="Shared Assets">
    <template v-for="asset in assetSet">
      <Asset
        :key="asset.id"
        v-if="asset.public && asset.owner !== user.name"
        :asset="asset"
        :itemType="'Scenario'"
        duplicate
        @duplicate="copyAsset($event)"
      />
    </template>
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
    })
  },
  methods: {
    ...mapActions({
      addAsset: "assets/addAsset"
    }),
    copyAsset(id) {
      //FIXME: needs check for duplicates
      this.addAsset({
        ...this.assetSet.find(asset => asset.id === id)
      });
    }
  }
};
</script>
