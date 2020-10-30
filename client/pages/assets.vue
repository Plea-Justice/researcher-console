<template>
  <ItemLayout
    :contentTitle="`My Assets: ${this.selectedType}`"
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

          <ToolBarButton @click="openSharedModal()" :value="sharedMode">
            Shared Assets
          </ToolBarButton>
        </b-tooltip>
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
    <p
      v-if="!assetSet.length"
      class="empty-text has-text-weight-medium is-size-5"
    >
      No assets exist!
      <br />Add an asset using the toolbar to get started.
    </p>

    <div v-for="type in selectedTypes" :key="type" class="section">
      <h3 class="title">{{ `${type}s` | capitalize }}</h3>

      <div class="item-grid">
        <template v-for="asset in assetSetByType[type]">
          <ItemCard
            :key="asset.id"
            v-if="!asset.public || asset.owner === user.name"
            :item="asset"
            :remove="asset.isMine"
            @remove="confirmDelete($event)"
            :edit="asset.isMine"
            @edit="openFormModal(asset)"
          >
            <b-image
              :src="`${envAPIURL}/api/v1/assets/${asset.id}/thumbnail`"
              src-fallback="/defaultThumbnail.png"
              responsive
              ratio="16by9"
              lazy
            />

            <div class="asset-meta content is-small">
              <span> Uploaded {{ asset.created | timeToNow }} </span>
              <span>{{ asset.owner }}</span>
            </div>

            <template v-slot:footer>
              <b-taglist style="margin-left: auto;">
                <b-tag v-if="asset.public" type="is-info">Public</b-tag>
                <b-tag type="is-primary">{{ asset.type | capitalize }}</b-tag>
              </b-taglist>
            </template>
          </ItemCard>
        </template>
      </div>
    </div>
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
import SharedAssets from "~/components/modals/SharedAssets";

// Content for help fields
import { assetsHelp } from "~/assets/helpText";

export default {
  name: "Scenarios",
  components: { ItemLayout, ToolBarButton, ItemCard, HelpSidebar },
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
      envAPIURL: process.env.API_URL
    };
  },
  computed: {
    user() {
      return this.$auth.user ? this.$auth.user : { name: "dev", sessions: 1 };
    },
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
    validTypes() {
      return Object.keys(this.assetSetByType).sort();
    },
    selectedTypes() {
      return this.selectedType === "all"
        ? this.validTypes
        : [this.selectedType];
    }
  },
  methods: {
    openFormModal(asset) {
      this.$buefy.modal.open({
        parent: this,
        component: AssetForm,
        props: { user: this.user, asset },
        hasModalCard: true,
        trapFocus: true
      });
    },
    openSharedModal() {
      this.$buefy.modal.open({
        parent: this,
        component: SharedAssets,
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
