<template>
  <ItemLayout
    :contentTitle="`My Assets: ${this.selectedType} ${
      `(${this.numSelectedAssets})` || ''
    }`"
    helpTitle="Asset Management"
    :helpText="assetsHelp.navbar"
  >
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
            Upload
          </ToolBarButton>
        </b-tooltip>
        <ToolBarButton
          v-if="hasSharedAssets"
          @click="openSharedModal()"
          :value="sharedMode"
        >
          Shared Asset Library
        </ToolBarButton>
      </div>
    </template>
    <template v-slot:toolbar-end>
      <b-field v-if="validTypes.length > 1">
        <b-select placeholder="Asset Type" v-model="selectedType">
          <option value="all">All</option>
          <option v-for="type in validTypes" :key="type" :value="type">
            {{ type | capitalize }}
          </option>
        </b-select>
      </b-field>
    </template>

    <!-- If no assets exists -->
    <div v-if="!numMyAssets" class="empty-text has-text-weight-medium is-size-5">
      <p>Your asset library is empty.</p><br />
      <p>Assets are needed to create an animated scenario.</p>
      <p>To get started, upload an asset or copy assets to here from the shared asset library.</p>
    </div>

    <template v-else>
      <div v-for="type in selectedTypes" :key="type" class="section">
        <h3 class="title">{{ `${type}s` | capitalize }}</h3>

        <div class="item-grid">
          <template v-for="asset in myAssetsByType[type]">
            <Asset
              :key="asset.id"
              :asset="asset"
              v-if="asset.owner === user.name"
              remove
              @remove="confirmDelete($event)"
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

      addMode: false,
      sharedMode: false,
      selectedType: "all",
    };
  },
  computed: {
    ...mapGetters({
      assetSet: "assets/assetSet",
    }),
    myAssetsByType() {
      return this.assetSet
        .filter((asset) => asset.owner === this.user.name)
        .reduce(
          (obj, asset) => (
            obj[asset.type]
              ? obj[asset.type].push(asset)
              : (obj[asset.type] = [asset]),
            obj
          ),
          {}
        );
    },
    validTypes() {
      return Object.keys(this.myAssetsByType).sort();
    },
    selectedTypes() {
      return this.selectedType === "all"
        ? this.validTypes
        : [this.selectedType];
    },
    numMyAssets() {
      return Object.values(this.myAssetsByType).reduce(
        (acc, assets) => (acc += assets.length),
        0
      );
    },
    numSelectedAssets() {
      return this.selectedType === "all"
        ? this.numMyAssets
        : this.myAssetsByType[this.selectedType].length;
    },
    hasSharedAssets() {
      return this.numMyAssets < this.assetSet.length;
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
    confirmDelete(id) {
      let name = "";
      for (const asset of this.assetSet)
        if (asset.id === id) {
          name = asset.name;
          break;
        }

      this.$buefy.modal.open({
        parent: this,
        component: DeleteAsset,
        props: { id, name, onConfirm: () => this.removeAsset(id) },
        hasModalCard: true,
        customClass: "dialog",
        trapFocus: true,
      });
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
.section:first-of-type {
  padding-top: 0;
}

.empty-text {
  position: absolute;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  height: 100%;
  width: 100%;

  position: absolute;
  top: 0;
  z-index: 1;

  background-color: #ffffff;
}

.asset-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}
</style>
