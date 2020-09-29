<template>
  <ItemLayout
    :contentTitle="`My Assets: ${this.selectedAssetType}`"
    helpTitle="Asset Management"
    :helpText="assetsHelp.navbar"
  >
    <template v-slot:toolbar-start>
      <div class="level-item buttons">
        <b-tooltip
          label="Your user is not permitted to add files"
          position="is-bottom"
          class="is-danger is-light"
          :active="!user.permitUploads"
        >
          <ToolBarButton
            @click="openFormModal()"
            :value="addMode"
            :disabled="!user.permitUploads"
            >Upload New Asset</ToolBarButton
          >
        </b-tooltip>
      </div>
    </template>
    <template v-slot:toolbar-end>
      <b-field v-if="validAssetTypes.length > 1">
        <b-select placeholder="Asset Type" v-model="selectedAssetType">
          <option value="all">All</option>
          <option v-for="type in validAssetTypes" :key="type" :value="type">{{
            type | capitalize
          }}</option>
        </b-select>
      </b-field>
    </template>

    <p
      v-if="!assetSet.length"
      class="empty-text has-text-weight-medium is-size-5"
    >
      No assets exists!
      <br />Add an asset using the toolbar to get started.
    </p>

    <template v-else>
      <ItemCard
        v-for="asset in filteredAssets"
        :key="asset.id"
        @remove="confirmDelete($event)"
        :item="asset"
        :remove="asset.isMine"
      >
        <b-image
          :src="
            `${$axios.defaults.baseURL}/api/v1/assets/${asset.id}/thumbnail`
          "
          src-fallback="/defaultThumbnail.png"
          responsive
          ratio="16by9"
          lazy
        />

        <div class="pt-1 content is-small">
          <span class="is-pulled-left">
            Uploaded {{ asset.created | timeToNow }}
          </span>
          <span class="is-pulled-right">{{ asset.owner }}</span>
        </div>

        <template v-slot:footer>
          <b-taglist style="margin-left: auto;">
            <b-tag v-if="asset.public" type="is-info">Public</b-tag>
            <b-tag type="is-primary">{{ asset.type | capitalize }}</b-tag>
          </b-taglist>
        </template>
      </ItemCard>
    </template>
  </ItemLayout>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import ItemLayout from "~/components/layouts/ItemLayout";
import ToolBarButton from "~/components/ToolBarButton";
import ItemCard from "~/components/cards/ItemCard";
import AssetForm from "~/components/modals/AssetForm";
import HelpSidebar from "~/components/HelpSidebar";
import DeleteAsset from "../components/modals/DeleteAsset";

// Content for help fields
import { assetsHelp } from "~/assets/helpText";

export default {
  name: "Scenarios",
  components: { ItemLayout, ToolBarButton, ItemCard, AssetForm, HelpSidebar },
  async fetch({ store, params }) {
    await store.dispatch("assets/getAssets");
  },
  data() {
    return {
      // import from JS file
      assetsHelp: assetsHelp,

      addMode: false,
      selectedAssetType: "all"
    };
  },
  computed: {
    ...mapGetters({
      assetSet: "assets/assetSet"
    }),
    assetSetByType() {
      return this.assetSet.reduce(
        (obj, item) => (
          obj[item.type]
            ? obj[item.type].push(item)
            : (obj[item.type] = [item]),
          obj
        ),
        {}
      );
    },
    validAssetTypes() {
      return Object.keys(this.assetSetByType).sort();
    },
    filteredAssets() {
      return this.selectedAssetType === "all"
        ? this.assetSet
        : this.assetSetByType[this.selectedAssetType];
    },
    user() {
      return this.$auth.user ? this.$auth.user : { name: "dev", n_sessions: 1 };
    }
  },
  methods: {
    openFormModal() {
      this.$buefy.modal.open({
        parent: this,
        component: AssetForm,
        props: { user: this.user },
        hasModalCard: true,
        trapFocus: true
      });
    },
    ...mapActions({
      removeAsset: "assets/removeAsset"
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
        trapFocus: true
      });
    }
  },
  head() {
    return {
      title: `${this.$siteConfig.title} | Assets`,
      meta: [
        {
          hid: "description",
          name: "description",
          content: "List of available assets"
        }
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
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
</style>
