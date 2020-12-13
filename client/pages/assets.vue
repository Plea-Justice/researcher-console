<template>
  <ItemLayout helpTitle="Asset Management" :helpText="assetsHelp.navbar">
    <template v-slot:toolbar-start>
      <div class="level-item buttons">
        <b-tooltip
          :active="!user.permitUploads"
          label="You're not permitted to add files, request permission from an admin"
          position="is-bottom"
          type="is-info is-light"
        >
          <ToolBarButton
            @click="openFormModal()"
            :value="addMode"
            :disabled="!user.permitUploads"
          >
            Upload New
          </ToolBarButton>
        </b-tooltip>
        <ToolBarButton
          v-if="hasSharedAssets"
          @click="openSharedModal()"
          :value="sharedMode"
        >
          Shared Asset Library
        </ToolBarButton>

        <b-field v-if="myAssetSet.length > 1">
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
      </div>
    </template>

    <template v-slot:toolbar-end>
      <b-field label="Batch Delete">
        <b-switch v-model="batchDelete" type="is-danger" />
      </b-field>
    </template>

    <template v-slot:header>
      <div class="flex-title">
        <h1 class="title">My Assets ({{ selectedAssets.length }})</h1>

        <b-field v-if="validTypes.length > 1" horizontal>
          <b-select v-model="selectedType" :disabled="isSearched">
            <option value="all">All</option>
            <option v-for="type in validTypes" :key="type" :value="type">
              {{ type | capitalize }}
            </option>
          </b-select>
        </b-field>
      </div>
    </template>

    <!-- If no assets exists -->
    <p
      v-if="!myAssetSet.length"
      class="empty-text has-text-weight-medium is-size-5"
    >
      Your asset library is empty, assets are used to create animated scenarios.
      <br />
      Upload or copy asset(s) from the shared asset library to get started.
    </p>

    <template v-else v-for="type in validTypes">
      <div
        v-if="selectedAssets.some((asset) => asset.type === type)"
        :key="type"
        class="box"
      >
        <h3 class="title">{{ `${type}s` | capitalize }}</h3>

        <div class="item-grid">
          <template
            v-for="asset in selectedAssets.filter(
              (asset) => asset.type === type
            )"
          >
            <Asset
              :key="asset.id"
              :asset="asset"
              v-if="asset.owner === user.name"
              remove
              @remove="deleteAsset($event)"
              edit
              @edit="openFormModal(asset)"
            />
          </template>
        </div>
      </div>
    </template>
  </ItemLayout>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Mixins
import User from "~/mixins/User";

// Import Components
import ItemLayout from "~/components/layouts/ItemLayout";
import ToolBarButton from "~/components/ToolBarButton";
import Asset from "~/components/cards/Asset";
import AssetForm from "~/components/modals/AssetForm";
import Help from "~/components/modals/Help";
import DeleteAsset from "../components/modals/DeleteAsset";
import SharedAssets from "~/components/modals/SharedAssets";

// Content for help fields
import { assetsHelp } from "~/assets/helpText";

export default {
  name: "Scenarios",
  mixins: [User],
  components: { ItemLayout, ToolBarButton, Asset, Help },
  async fetch({ store, params }) {
    await store.dispatch("assets/getAssets");
  },
  data() {
    return {
      // import from JS file
      assetsHelp,

      batchDeleteState: false,
      addMode: false,
      sharedMode: false,
      searchName: "",
      selectedType: "all",
    };
  },
  computed: {
    batchDelete: {
      get() {
        return this.batchDeleteState;
      },
      set(newValue) {
        if (newValue)
          this.$buefy.dialog.confirm({
            title: "Batch Delete Scenarios",
            message:
              "You will <b>not</b> be warned before deleting individual assets while active,<br /> deleted assets are <b>not recoverable</b>!",
            confirmText: "I Understand",
            type: "is-danger",
            hasIcon: true,
            onConfirm: () => (this.batchDeleteState = true),
          });
        else this.batchDeleteState = false;
      },
    },
    isSearched() {
      return this.searchName !== "";
    },
    ...mapGetters({
      assetSet: "assets/assetSet",
    }),
    myAssetSet() {
      return this.assetSet.filter((asset) => asset.owner === this.user.name);
    },
    validTypes() {
      return [...new Set(this.myAssetSet.map((asset) => asset.type))];
    },
    searchList() {
      return this.myAssetSet
        .map((asset) => asset.name)
        .filter(
          (name) =>
            name.toLowerCase().indexOf(this.searchName.toLowerCase()) >= 0
        );
    },
    selectedAssets() {
      if (this.searchName !== "") {
        return this.myAssetSet.filter((asset) =>
          this.searchList.includes(asset.name)
        );
      } else if (this.selectedType !== "all") {
        return this.myAssetSet.filter(
          (asset) => asset.type === this.selectedType
        );
      } else {
        return this.myAssetSet;
      }
    },
    hasSharedAssets() {
      return this.assetSet.length > this.myAssetSet.length;
    },
  },
  methods: {
    openFormModal(asset) {
      this.$buefy.modal.open({
        parent: this,
        component: AssetForm,
        props: { user: this.user, asset },
        hasModalCard: true,
        trapFocus: true,
      });
    },
    openSharedModal() {
      this.$buefy.modal.open({
        parent: this,
        component: SharedAssets,
        hasModalCard: true,
        trapFocus: true,
      });
    },
    ...mapActions({
      removeAsset: "assets/removeAsset",
    }),
    deleteAsset(id) {
      if (!this.batchDelete) {
        const name = this.assetSet.find((asset) => asset.id === id).name;

        this.$buefy.modal.open({
          parent: this,
          component: DeleteAsset,
          props: { id, name, onConfirm: () => this.removeAsset(id) },
          hasModalCard: true,
          customClass: "dialog",
          trapFocus: true,
        });
      } else this.removeAsset(id);
    },
  },
  head() {
    return {
      title: `${this.$siteConfig.title} | Assets`,
      meta: [
        {
          hid: "description",
          name: "description",
          content: "List of available assets",
        },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
.flex-title {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}
</style>
