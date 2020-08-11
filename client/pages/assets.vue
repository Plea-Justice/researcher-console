<template>
  <ItemLayout
    :contentTitle="`Assets: ${this.selectedAssetType}`"
    helpTitle="Asset Management"
    :helpText="assetsHelp.navbar"
  >
    <template v-slot:toolbar-start>
      <div class="level-item buttons">
        <ToolBarButton v-model="addMode" @click="toggleAddMode()">Add</ToolBarButton>
      </div>
    </template>
    <template v-slot:toolbar-end>
      <b-field v-if="validAssetTypes.length > 1">
        <!-- FIXME: make this a simplified custom selector -->
        <b-select placeholder="Asset Type" v-model="selectedAssetType">
          <option value="all">All</option>
          <option v-for="type in validAssetTypes" :key="type" :value="type">{{ type | capitalize }}</option>
        </b-select>
      </b-field>
    </template>

    <form v-show="addMode" @submit.prevent="onSubmit()">
      <ItemCard ref="form-card" save>
        <template v-slot:header>
          <b-button @click="closeForm()" icon-left="times" type="is-text" />

          <b-input
            ref="focus_target"
            v-model="assetForm.name"
            placeholder="Name"
            class="flex-grow"
            required
          />
        </template>

        <div class="input-wrapper">
          <b-field label="File Upload">
            <b-field>
              <b-upload v-model="assetForm.file" accept=".js, .jpg, .png" required native>
                <a class="button is-light">
                  <b-icon size="is-small" icon="cloud-upload-alt" />
                  <span>{{ assetForm.file.name || "Click to upload" }}</span>
                </a>
              </b-upload>
              <HelpSidebar :text="assetsHelp.upload" title="Asset Uploads" class="control" />
            </b-field>
          </b-field>

          <b-field label="Asset Type">
            <b-field>
              <b-select placeholder="Select a type" v-model="assetForm.type" expanded required>
                <option
                  v-for="type in allAssetTypes"
                  :key="type"
                  :value="type"
                >{{ type | capitalize }}</option>
              </b-select>
              <HelpSidebar :text="assetsHelp.type" title="Asset Types" class="control" />
            </b-field>
          </b-field>
        </div>
      </ItemCard>
    </form>

    <p v-if="!addMode && !assetSet.length" class="empty-text has-text-weight-medium is-size-5">
      No assets exists!
      <br />Add an asset from the toolbar to get started.
    </p>

    <template v-else>
      <ItemCard
        v-for="asset in filteredAssets"
        :key="asset.id"
        @remove="confirmDelete($event)"
        :item="asset"
        close
      >
        <!-- FIXME: use lazyloading for this, loading indicator -->
        <img
          :src="`${$axios.defaults.baseURL}/api/v1/assets/${asset.id}/thumbnail`"
          width="100%"
          loading="lazy"
          onerror="this.src = '/defaultThumbnail.png'; this.onerror = false;"
        />
        <p class="content is-small">Uploaded {{ posixTimeToHoursAgo(asset.created) }}</p>
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
import HelpSidebar from "~/components/HelpSidebar";
import DeleteAsset from "../components/modals/DeleteAsset";

// Content for help fields
import { assetsHelp } from "~/assets/helpText";

// Last modified time
import { posixTimeToHoursAgo } from "~/assets/util";

export default {
  name: "Scenarios",
  components: { ItemLayout, ToolBarButton, ItemCard, HelpSidebar },
  async fetch({ store, params }) {
    await store.dispatch("assets/getAssets");
  },
  data() {
    // Template for Form
    const AssetForm = {
      name: "",
      type: null,
      file: {}
    };

    return {
      // import from JS file
      assetsHelp: assetsHelp,

      AssetForm,
      assetForm: Object.assign({}, AssetForm),

      addMode: false,
      selectedAssetType: "all"
    };
  },
  computed: {
    ...mapGetters({
      allAssetTypes: "assets/allAssetTypes",
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
    }
  },
  methods: {
    toggleAddMode() {
      if (this.addMode) {
        this.$nextTick(() => this.$refs.focus_target.focus());
      } else {
        this.assetForm = Object.assign({}, this.AssetForm);
      }
    },
    closeForm() {
      this.addMode = false;
      this.assetForm = Object.assign({}, this.AssetForm);
    },
    ...mapActions({
      addAsset: "assets/addAsset",
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
    },
    onSubmit() {
      // If that filename already exists
      if (this.assetSet.some(({ name }) => name === this.assetForm.name)) {
        this.$buefy.toast.open({
          message: "An asset with the same name already exists",
          type: "is-danger"
        });

        // Clear name and re-focus on name input
        this.assetForm.name = "";
        this.$refs["form-card"].focus();
        return;

        // TODO: This file upload size is defined in server config.js.
      } else if (this.assetForm.file.size > 1024 * 1024 * 20) {
        this.$buefy.toast.open({
          message: `${this.assetForm.file.name} too large. Must be less than 20MiB in size.`,
          type: "is-danger"
        });
      } else {
        // Add the scenario to state
        this.addAsset(this.assetForm);
      }

      // Disable form
      this.addMode = false;

      // Reset inputs
      this.assetForm = Object.assign({}, this.AssetForm);
    },
    posixTimeToHoursAgo: posixTimeToHoursAgo
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
// Create space between form inputs
.input-wrapper {
  // Everything except last child
  & > :nth-last-child(n + 2) {
    margin-bottom: 1.5rem;
  }
}

.flex-grow {
  flex-grow: 1;
}

.empty-text {
  position: absolute;
}
</style>
