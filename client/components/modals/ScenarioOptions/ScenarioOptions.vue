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
              v-if="!scenarioForm.survey"
              label="Insert a link to your Qualtrics survey."
              position="is-right"
            >
              <b-icon icon="info-circle" type="is-info" size="is-small" />
            </b-tooltip>
          </template>
          <form-group label="Name" :validator="$v.scenarioForm.name">
            <b-input v-model="$v.scenarioForm.name.$model" maxlength="30" />
          </form-group>

          <form-group
            label="Description"
            :validator="$v.scenarioForm.description"
          >
            <b-input
              v-model="$v.scenarioForm.description.$model"
              type="textarea"
              customClass="has-fixed-size"
              placeholder="Description"
              maxlength="100"
            />
          </form-group>

          <form-group
            label="Survey URL"
            :validator="$v.scenarioForm.survey"
            :type="surveyWarn.type"
            :message="surveyWarn.message"
            v-slot="{ type }"
          >
            <b-field :type="type">
              <b-input
                v-model="$v.scenarioForm.survey.$model"
                @focus="setFocus(true)"
                @blur="setFocus(false)"
                expanded
              />
              <Help
                :text="optionsHelp.url"
                title="Survey URL"
                class="control"
              />
            </b-field>
          </form-group>

          <form-group label="Share with Others">
            <b-field
              class="flex-field"
              :message="
                scenarioForm.public
                  ? 'You acknowledge that your asset may be used in others\' experiments.'
                  : ''
              "
            >
              <b-tooltip
                :active="!user.permitSharing"
                label="You're not permitted share files, request persmission from an admin"
                position="is-bottom"
                type="is-info is-light"
              >
                <b-switch
                  :disabled="!user.permitSharing"
                  v-model="scenarioForm.public"
                  type="is-info"
                >
                  Make Public
                </b-switch>
              </b-tooltip>
            </b-field>
          </form-group>

          <form-group v-if="scenarioForm.public" label="Citation">
            <b-field message="This is how others will cite your work.">
              <b-input
                v-model="scenarioForm.citation"
                placeholder="e.g. Smith, J. (2020). Title of artwork [Digital]."
                customClass="has-fixed-size"
                maxlength="100"
              />
            </b-field>
          </form-group>
        </b-tab-item>

        <b-tab-item value="assets">
          <!-- This doesn't have proper styling for label -->
          <template v-slot:header>
            <span>Assets</span>
            <!-- FIXME: Tooltip position is-right because other positions appear under tab body or card header. -->
            <b-tooltip
              v-if="scenarioAssetList.length < 1"
              label="Select assets from your library to use in this scenario."
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
import Help from "~/components/modals/Help";
import AssetSelection from "~/components/modals/ScenarioOptions/AssetSelection";
import Tags from "~/components/modals/ScenarioOptions/Tags";

// Import Vuelidate Rules
import { required, maxLength } from "vuelidate/lib/validators";
import { helpers } from "vuelidate/lib/validators";

// Content for help fields
import { scenarioOptionsHelp } from "~/assets/helpText";
import FormGroup from "../../form/FormGroup.vue";

export default {
  name: "ScenarioOptions",
  mixins: [User],
  components: { Help, AssetSelection, Tags },
  props: {
    openTab: String,
  },
  async fetch({ store, params }) {
    await store.dispatch("assets/getAssets");
  },
  data() {
    return {
      tab: this.openTab || "settings",
      optionsHelp: scenarioOptionsHelp,
      scenarioForm: Object.assign({}, this.$store.state.scenario.meta),
      surveyFocused: false,
    };
  },
  validations() {
    const url = helpers.regex(
      "url",
      /^(https?:\/\/|\/|[a-zA-Z0-9].+?\.html).*$/
    );

    return {
      scenarioForm: {
        name: {
          required,
          maxLength: maxLength(30),
        },
        description: {
          maxLength: maxLength(200),
        },
        survey: {
          url,
        },
      },
    };
  },
  computed: {
    ...mapGetters({
      scenarioAssetList: "scenario/assetList",
    }),
    surveyWarn() {
      let status = false;
      if (this.scenarioForm.survey === "") {
        status = {
          type: "is-warning",
          message: "Remember to add a survery url",
        };
      } else if (this.$v.scenarioForm.survey.$invalid && this.surveyFocused) {
        status = { type: "is-warning" };
      }
      return status;
    },
  },
  methods: {
    setFocus(focus) {
      this.surveyFocused = focus;
    },
    ...mapActions({
      updateMeta: "scenario/updateMeta",
      saveMeta: "scenario/saveMeta",
    }),
    onSubmit() {
      this.updateMeta(this.scenarioForm);

      this.saveMeta();
      this.$parent.close();
    },
  },
};
</script>
