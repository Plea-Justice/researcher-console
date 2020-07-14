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
          <option v-for="type in validAssetTypes" :key="type" :value="type">{{ type | capitalize }}</option>
        </b-select>
      </b-field>
    </template>

    <form v-show="addMode" @submit.prevent="onSubmit()">
      <ItemCard ref="form-card" v-model="assetForm" save>
        <b-field label="File Upload">
          <b-field>
            <b-upload v-model="assetForm.file" required native accept=".js, .jpg, .png">
              <a class="button is-light">
                <b-icon size="is-small" icon="cloud-upload" />
                <span>{{ assetForm.file.name || "Click to upload"}}</span>
              </a>
            </b-upload>
            <HelpSidebar class="control" title="Asset Uploads" :text="assetsHelp.upload" />
          </b-field>
        </b-field>
        <br />
        <b-field label="Asset Type">
          <b-field>
            <b-select placeholder="Select a type" v-model="assetForm.type" expanded required>
              <option
                v-for="type in allAssetTypes"
                :key="type"
                :value="type"
              >{{ type | capitalize }}</option>
            </b-select>
            <HelpSidebar class="control" title="Asset Types" :text="assetsHelp.type" />
          </b-field>
        </b-field>
      </ItemCard>
    </form>
    <ItemCard
      v-for="asset in filteredAssets"
      :key="asset.id"
      @remove="removeAsset($event)"
      :item="asset"
      close
    >
      <p>DEBUG: {{ asset }}</p>
    </ItemCard>
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
    return {
      // import from JS file
      assetsHelp: assetsHelp,
      addMode: false,
      // TODO: Make this an enum?
      selectedAssetType: "all",

      //FIXME: make this dynamic
      assetForm: {
        name: "",
        type: "",
        file: {}
      }
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
          "Deleted assets are not recoverable.<br /><br />Are you sure you would like to delete this asset?",
        confirmText: "Delete",
        type: "is-danger",
        hasIcon: true,
        onConfirm: () => this.removeAsset(event)
      });
    },
    onSubmit() {
      let asset = new FormData();
      asset.append("file", this.assetForm.file);
      asset.append("type", this.assetForm.type);
      asset.append("name", this.assetForm.name);

      // Add the scenario to state
      this.addAsset(asset);

      // Reset the inputs
      // FIXME: make this dynamic
      this.assetForm = {
        name: "",
        type: "",
        file: {}
      };

      // Disable form
      this.addMode = false;
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
