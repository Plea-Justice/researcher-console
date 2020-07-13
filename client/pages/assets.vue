<template>
  <div>
    <NavBar helpTitle="Asset Management"
      helpText="Assets are resource files which make up animated scenes. These include foreground and background images,
       movie clips exported to Javascript from Adobe Animate, and actor (character) assets exported from Adobe Animate.
       The default plea research assets should appear here. You may add your own by clicking 'Add Asset', uploading
       a JPEG or PNG image or exported JavaScript asset, and selecting the type of asset you have uploaded." 
    />

    <ToolBar>
      <template v-slot:start>
        <div class="level-item buttons">
          <b-button
            class="level-item"
            :disabled="addMode"
            @click="toggleAddMode()"
            >Add Asset</b-button
          >
        </div>
      </template>

      <template v-slot:end>
        <b-field v-if="validAssetTypes.length > 1">
          <b-select placeholder="Asset Type" v-model="selectedAssetType">
            <option value="all">All</option>
            <option v-for="type in validAssetTypes" :key="type" :value="type">{{
              type | capitalize
            }}</option>
          </b-select>
        </b-field>
      </template>
    </ToolBar>

    <section class="section container">
      <h1 class="title is-capitalized">
        {{
          selectedAssetType === "all"
            ? "Assets"
            : `Assets: ${selectedAssetType}`
        }}
      </h1>

      <div class="grid">
        <form v-show="addMode" @submit.prevent="onSubmit()">
          <ItemCard ref="form-card" v-model="assetForm" save>
            <b-field label="File Upload">
              <b-field>
                <b-upload v-model="assetForm.file" required native
                  accept=".js, .jpg, .png">
                  <a class="button is-light">
                    <b-icon size="is-small" icon="cloud-upload" />
                    <span>{{ assetForm.file.name || "Click to upload"}}</span>
                  </a>
                </b-upload>
                <HelpSidebar class="control"
                  title="Asset Uploads"
                  text="Valid filetypes are '.js' animated assets and '.jpg' or '.png' image files." />
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
                    >{{ type | capitalize }}</option
                  >
                </b-select>
                <HelpSidebar class="control"
                  title="Asset Types"
                  text="Asset types may be actor, clip, foreground or background. Actors are individual characters
                    who may speak whereas clips are premade movie clips that will play through like a video. Both must
                    be files exported from Adobe Animate ending in '.js'. Foregrounds and backgrounds are image files
                    and must end in '.png' or '.jpg'." />
              </b-field>
            </b-field>
          </ItemCard>
        </form>
        <ItemCard
          v-for="asset in filteredAssets"
          :key="asset.id"
          @remove="confirmDelete($event)"
          :item="asset"
          close
        >
          <p>DEBUG: {{ asset }}</p>
        </ItemCard>
      </div>
    </section>
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import NavBar from "~/components/NavBar";
import ToolBar from "~/components/ToolBar";
import ItemCard from "~/components/cards/ItemCard";
import HelpSidebar from "~/components/HelpSidebar";

export default {
  name: "Scenarios",
  components: { NavBar, ToolBar, ItemCard, HelpSidebar },
  async fetch({ store, params }) {
    await store.dispatch("assets/getAssets");
  },
  data() {
    return {
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
      this.addMode = !this.addMode;

      if (this.addMode) this.$nextTick(() => this.$refs["form-card"].focus());
    },
    ...mapActions({
      addAsset: "assets/addAsset",
      removeAsset: "assets/removeAsset"
    }),
    confirmDelete(event) {
      this.$buefy.dialog.confirm({
        title: 'Delete Asset',
        message: 'Deleted assets are not recoverable.<br /><br />Are you sure you would like to delete this asset?',
        confirmText: 'Delete',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: () => this.removeAsset(event)
      })
    },
    onSubmit() {
      let asset = new FormData();
      asset.append('file', this.assetForm.file);
      asset.append('type', this.assetForm.type);
      asset.append('name', this.assetForm.name);

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
      title: `${this.$siteConfig.title} | Scenarios`,
      meta: [
        {
          hid: "description",
          name: "description",
          content: "List of available scenarios"
        }
      ]
    };
  }
};
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 350px));
  gap: 15px;
}
</style>
