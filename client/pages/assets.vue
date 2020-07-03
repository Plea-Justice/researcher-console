<template>
  <div>
    <NavBar help />

    <ToolBar>
      <template v-slot:start>
        <div class="level-item buttons">
          <b-button class="level-item" :disabled="addMode" @click="addAsset()">Add Asset</b-button>
        </div>
      </template>

      <template v-slot:end>
        <b-field v-if="validAssetTypes.length > 1">
          <b-select placeholder="Asset Type" v-model="selectedAssetType">
            <option value="all">all</option>
            <option v-for="type in validAssetTypes" :key="type" :value="type">{{ type }}</option>
          </b-select>
        </b-field>
      </template>
    </ToolBar>

    <section class="section container">
      <h1
        class="title is-capitalized"
      >{{ selectedAssetType === "all" ? "Assets" : `Assets: ${selectedAssetType}` }}</h1>

      <div class="grid">
        <form v-show="addMode" @submit.prevent="onSubmit()">
          <ItemCard ref="form-card" v-model="assetForm" save>
            <b-field label="Asset Type">
              <b-select placeholder="Select a type">
                <option v-for="type in allAssetTypes" :key="type" :value="type">{{ type }}</option>
              </b-select>
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

export default {
  name: "Scenarios",
  components: { NavBar, ToolBar, ItemCard },
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
        type: ""
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
    addAsset() {
      this.addMode = true;

      this.$nextTick(() => {
        this.$refs["form-card"].$refs["form-card-input"].focus();
      });
    },
    onSubmit() {
      // Add the scenario to state
      this.addAsset(this.assetForm);

      // Reset the inputs
      // FIXME: make this dynamic
      this.assetForm = {
        name: "",
        type: ""
      };

      // Disable form
      this.addMode = false;
    },
    ...mapActions({
      addAsset: "assets/addAsset",
      removeAsset: "assets/removeAsset"
    })
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}
</style>
