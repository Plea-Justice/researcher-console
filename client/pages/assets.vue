<template>
  <ItemLayout contentTitle="Assets" helpTitle="Asset Management" :helpText="assetsHelp.navbar">
    <template v-slot:toolbar-start>
      <div class="level-item buttons">
        <ToolBarButton v-model="addMode" @click="toggleAddMode()">Add</ToolBarButton>
      </div>
    </template>
    <template v-slot:toolbar-end>
      <b-field v-if="validAssetTypes.length > 1">
        <!-- FIXME: make this a simplified custom selector -->
        <b-select placeholder="Asset Type" v-model="selectedAssetType">
          <option value="all">all</option>
          <option v-for="type in validAssetTypes" :key="type" :value="type">
            {{
            type | capitalize
            }}
          </option>
        </b-select>
      </b-field>
    </template>

    <form v-show="addMode" @submit.prevent="onSubmit()">
      <ItemCard ref="form-card" v-model="assetForm" save>
        <div class="input-wrapper">
          <b-field label="File Upload">
            <b-field>
              <b-upload v-model="assetForm.file" accept=".js, .jpg, .png" required native>
                <a class="button is-light">
                  <b-icon size="is-small" icon="cloud-upload" />
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
    <ItemCard
      v-for="asset in filteredAssets"
      :key="asset.id"
      @remove="removeAsset($event)"
      :item="asset"
      close
    ></ItemCard>
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

// Content for help fields
import { assetsHelp } from "~/assets/helpText";

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
      if (this.addMode) this.$nextTick(() => this.$refs["form-card"].focus());
    },
    ...mapActions({
      addAsset: "assets/addAsset",
      removeAsset: "assets/removeAsset"
    }),
    confirmDelete(event) {
      this.$buefy.dialog.confirm({
        title: "Delete Asset",
        message:
          "Deleted assets are not recoverable.<br /><br />Are you sure you want to delete this asset?",
        confirmText: "Delete",
        type: "is-danger",
        hasIcon: true,
        onConfirm: () => this.removeAsset(event)
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
      } else {
        // Add the scenario to state
        this.addAsset(this.assetForm);

        // Disable form
        this.addMode = false;

        // Reset inputs
        this.assetForm = Object.assign({}, this.AssetForm);
      }
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
// Create space between form inputs
.input-wrapper {
  // Everything except last child
  & > :nth-last-child(n + 2) {
    margin-bottom: 1.5rem;
  }
}
</style>
