<template>
  <div>
    <p class="content">
      <span
        v-if="!assetList.length"
        class="content has-text-warning has-text-weight-bold"
      >
        No assets currently selected
      </span>
      <br />
      Select assets for use in this scenario
    </p>

    <Shuttle
      lhead="Available Assets"
      rhead="Selected for Use"
      keyfield="id"
      textfield="name"
      :options="assetSet.filter((asset) => asset.owner === user.name)"
      :preselected="assetList"
      @selected="assetList = $event"
    >
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
  </div>
</template>

<script>
// Import Components
import Shuttle from "~/components/form/Shuttle";

// Import Mixins
import User from "~/mixins/User";

// Import VueX
import { mapGetters, mapActions } from "vuex";

export default {
  components: { Shuttle },
  mixins: [User],
  computed: {
    ...mapGetters({
      assetSet: "assets/assetSet",
      assets: "assets/assets",
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
