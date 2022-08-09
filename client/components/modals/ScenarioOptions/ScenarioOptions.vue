<template>
  <form @submit.prevent="onSubmit()" class="modal-card" style="width: 50vw">
    <header class="modal-card-head">
      <p class="modal-card-title">Scenario Options</p>
    </header>

    <section class="modal-card-body">
      <b-tabs v-model="tab">
        <b-tab-item value="settings">
          <template v-slot:header>
            <span>Settings</span>
            <b-tooltip
              v-if="!scenarioMeta.survey"
              label="Insert a link to your Qualtrics survey."
              type="is-info is-light"
              position="is-right"
            >
              <b-icon icon="info-circle" type="is-info" />
            </b-tooltip>
          </template>
          <Settings
            ref="settings"
            @close="close()"
            :scenarioMeta="scenarioMeta"
            :id="user.id"
          />
        </b-tab-item>

        <b-tab-item value="assets">
          <template v-slot:header>
            <span>Assets</span>
            <!-- FIXME: Tooltip position is-right because other positions appear under tab body or card header. -->
            <b-tooltip
              v-if="scenarioAssetList.length < 1"
              label="Select assets from your library to use in this scenario."
              type="is-info is-light"
              position="is-right"
            >
              <b-icon icon="info-circle" type="is-info" />
            </b-tooltip>
          </template>
          <AssetSelection />
        </b-tab-item>

        <b-tab-item label="Tags" value="tags">
          <Tags />
        </b-tab-item>
      </b-tabs>
    </section>

    <footer v-if="tab === 'settings'" class="modal-card-foot">
      <b-button
        native-type="submit"
        label="Update Settings"
        type="is-primary"
        expanded
      />
    </footer>
  </form>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Mixins
import User from "~/mixins/User";

// Import Components
import Settings from "~/components/modals/ScenarioOptions/Settings";
import AssetSelection from "~/components/modals/ScenarioOptions/AssetSelection";
import Tags from "~/components/modals/ScenarioOptions/Tags";

export default {
  name: "ScenarioOptions",
  mixins: [User],
  components: { Settings, AssetSelection, Tags },
  props: {
    openTab: String,
  },
  async fetch({ store, params }) {
    await store.dispatch("assets/getAssets");
  },
  data() {
    return {
      tab: this.openTab && this.openTab !== "" ? this.openTab : "settings",
    };
  },
  computed: {
    ...mapGetters({
      scenarioMeta: "scenario/scenarioMeta",
      scenarioAssetList: "scenario/assetList",
    }),
  },
  methods: {
    onSubmit() {
      this.$refs.settings.onSubmit();
    },
    close() {
      this.$parent.close();
    },
    ...mapActions({
      updateMeta: "scenario/updateMeta",
    }),
  },
};
</script>
