<template>
  <Shuttle
    label="Select assets for use in this scenario."
    lhead="Available Assets"
    rhead="Selected for Use"
    keyfield="id"
    textfield="name"
    :options="assetSet.filter(asset => asset.owner === user.name)"
    :preselected="assetList"
    @selected="assetList = $event"
  >
    <template v-slot:nooptions>
      <p>Your assets library is empty.</p>
      <span>&nbsp;</span>
      <p>Click "Assets" in the navigation bar to add assets to your account.</p>
    </template>
    <template v-slot:litem="{ item }">
      <span>{{ item.name }} ({{ item.type }})</span>
      <p class="is-size-7">{{ item.description }}</p>
      <p v-if="item.citation" class="is-size-7">
        <i>{{ item.citation }}</i>
      </p>
    </template>
    <template v-slot:ritem="{ item }">
      <span>{{ item.name }} ({{ item.type }})</span>
      <p class="is-size-7">{{ item.description }}</p>
      <p v-if="item.citation" class="is-size-7">
        <i>{{ item.citation }}</i>
      </p>
    </template>
  </Shuttle>
</template>

<script>
// Import Components
import Shuttle from "~/components/form/Shuttle";

// Import VueX
import { mapGetters, mapActions } from "vuex";
import User from "~/mixins/User";

export default {
  components: { Shuttle },
  mixins: [User],
  computed: {
    ...mapGetters({
      assetSet: "assets/assetSet",
      assets: "assets/assets",
      getAssetList: "scenario/assetList"
    }),
    assetList: {
      get: function() {
        return this.getAssetList;
      },
      set: function(newValue) {
        this.updateAssetList({ assetList: newValue });
      }
    }
  },

  methods: {
    ...mapActions({
      updateAssetList: "scenario/updateAssetList"
    })
  }
};
</script>
