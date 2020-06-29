<template>
  <div>
    <!-- FIXME: make this the current path -->
    <NavBar help />

    <ToolBar ref="toolbar">
      <template v-slot:start>
        <div class="level-item buttons">
          <b-button class="level-item" :disabled="openForm" @click="openAssetForm()">Add Asset</b-button>
        </div>
      </template>
    </ToolBar>

    <section class="section container">
      <h1 class="title">Assets</h1>

      <div class="grid">
        <form v-show="openForm" ref="form" @submit.prevent="onSubmit()">
          <ItemCard v-model="assetData">
            <b-field label="Asset Type">
              <b-select placeholder="Select a type">
                <!-- FIXME: populate this -->
              </b-select>
            </b-field>
          </ItemCard>
        </form>
        <ItemCard
          v-for="asset in assetSet"
          :key="asset.name"
          @remove="removeAsset($event)"
          :item="asset"
        >
          <p>Preview</p>
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
import ItemCard from "~/components/ItemCard";

export default {
  name: "Scenarios",
  components: { NavBar, ToolBar, ItemCard },
  async fetch({ store, params }) {
    await store.dispatch("assets/getAssets");
  },
  data() {
    const openForm = false;

    //FIXME: make this dynamic
    const assetData = {
      name: "",
      type: ""
    };

    return { openForm, assetData };
  },
  computed: {
    ...mapGetters({
      assetSet: "assets/assetSet"
    })
  },
  methods: {
    openAssetForm() {
      this.openForm = true;
    },
    onSubmit() {
      // Add the scenario to state
      this.addAsset(this.assetData);

      // Reset the inputs
      // FIXME: make this dynamic
      this.assetData = {
        name: "",
        type: ""
      };

      // Disable form
      this.openForm = false;
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

.toolbar {
  height: 5rem;
  padding: 0 4%;
  background-color: whitesmoke;
}
</style>
