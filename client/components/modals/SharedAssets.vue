<template>
  <SharedItems>
    <template v-slot:header>
      <div class="flex-title">
        <h1 class="modal-card-title">
          Shared Assets ({{ selectedAssets.length }})
        </h1>

        <template v-if="sharedAssetSet.length > 1">
          <b-field
            v-if="validOwners.length > 1 || validTypes.length > 1"
            horizontal
          >
            <b-select
              v-if="validOwners.length > 1"
              v-model="selectedOwner"
              :disabled="isSearched"
            >
              <option value="all">All</option>
              <option v-for="owner in validOwners" :key="owner" :value="owner">
                {{ owner }}
              </option>
            </b-select>

            <b-select
              v-if="validTypes.length > 1"
              v-model="selectedType"
              :disabled="isSearched"
            >
              <option value="all">All</option>
              <option v-for="type in validTypes" :key="type" :value="type">
                {{ type | capitalize }}
              </option>
            </b-select>
          </b-field>

          <b-field>
            <b-autocomplete
              v-model="searchName"
              :data="searchList"
              placeholder="Search by asset name"
              icon="search"
              clearable
            >
              <template slot="empty">No results found</template>
            </b-autocomplete>
          </b-field>
        </template>
      </div>
    </template>

    <Asset
      v-for="asset in selectedAssets"
      :key="asset.id"
      :asset="asset"
      :itemType="'Scenario'"
      :labels="{ duplicate: 'Copy to My Assets' }"
      duplicate
      @duplicate="copyAsset($event)"
      hidepublic
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
  data() {
    return {
      selectedOwner: "all",
      selectedType: "all",
      searchName: "",
    };
  },
  computed: {
    isSearched() {
      return this.searchName !== "";
    },
    ...mapGetters({
      assetSet: "assets/assetSet",
    }),
    sharedAssetSet() {
      return this.assetSet.filter(
        (asset) => asset.public && asset.owner !== this.user.name
      );
    },
    validTypes() {
      return [...new Set(this.sharedAssetSet.map((asset) => asset.type))];
    },
    validOwners() {
      return [...new Set(this.sharedAssetSet.map((asset) => asset.owner))];
    },
    searchList() {
      return this.sharedAssetSet
        .map((asset) => asset.name)
        .filter(
          (name) =>
            name.toLowerCase().indexOf(this.searchName.toLowerCase()) >= 0
        );
    },
    selectedAssets() {
      if (this.searchName !== "") {
        return this.sharedAssetSet.filter((asset) =>
          this.searchList.includes(asset.name)
        );
      } else if (this.selectedType === "all" && this.selectedOwner === "all") {
        return this.sharedAssetSet;
      } else if (this.selectedType !== "all" && this.selectedOwner !== "all") {
        return this.sharedAssetSet.filter(
          (asset) =>
            asset.type === this.selectedType &&
            asset.owner === this.selectedOwner
        );
      } else if (this.selectedOwner !== "all") {
        return this.sharedAssetSet.filter(
          (asset) => asset.owner === this.selectedOwner
        );
      } else {
        return this.sharedAssetSet.filter(
          (asset) => asset.type === this.selectedType
        );
      }
    },
  },
  methods: {
    ...mapActions({
      duplicateAsset: "assets/duplicateAsset",
    }),
    async copyAsset(id) {
      const numAssets = this.assetSet.length;
      //FIXME: needs check for duplicates
      await this.duplicateAsset(id);
      if (this.assetSet.length > numScenarios)
        this.$buefy.toast.open({
          message: "Copied Asset",
          type: "is-success",
        });
    },
  },
};
</script>
<style scoped lang="scss">
.flex-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;

  & > .field {
    margin-bottom: 0;
  }
}
</style>
