<template>
  <div class="modal-card" style="width: 50vw">
    <form @submit.prevent="onSubmit()">
      <header class="modal-card-head">
        <p class="modal-card-title">Scenario Options</p>
      </header>

      <section class="modal-card-body">
        <b-tabs v-model="tab">
          <b-tab-item value="settings">
          <template v-slot:header>
            <span>Settings</span>
            <b-tooltip v-if="!scenarioForm.survey" label="Insert a link to your Qualtrics survey." position="is-right">
              <b-icon icon="info-circle" type="is-warning" size="is-small"/>
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
                <HelpSidebar
                  :text="optionsHelp.url"
                  title="Survey URL"
                  class="control"
                />
              </b-field>
            </form-group>

            <form-group label="Share with Others">
              <b-field>
                <b-switch
                  :disabled="!user.permitSharing"
                  v-model="scenarioForm.public"
                  type="is-info"
                >
                  Make Public
                </b-switch>
              </b-field>
            </form-group>
          </b-tab-item>

          <b-tab-item value="assets">
          <template v-slot:header>
            <span>Assets</span>
            <!-- FIXME: Tooltop position is right because other positions appear under tab body or card header. -->
            <b-tooltip v-if="scenarioForm.assetList.length < 1" label="Select assets from the library for use in this scenario." position="is-right">
              <b-icon icon="info-circle" type="is-warning" size="is-small"/>
            </b-tooltip>
          </template>
            <Shuttle
              label="Select assets for use in this scenario."
              lhead="Available Assets"
              rhead="Selected for Use"
              keyfield="id"
              textfield="name"
              :options="assetSet"
              :preselected="scenarioForm.assetList"
              @selected="updateAssets"
            />
          </b-tab-item>

          <b-tab-item label="Tags" value="tags">
            <Tags />
          </b-tab-item>
        </b-tabs>
      </section>

      <footer class="modal-card-foot">
        <b-button type="is-primary" native-type="submit" value="Save" expanded>
          Save
        </b-button>
      </footer>
    </form>
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Mixins
import User from "~/mixins/User";

// Import Components
import Tags from "~/components/modals/ScenarioOptions/Tags";
import Shuttle from "~/components/form/Shuttle";
import HelpSidebar from "~/components/HelpSidebar";

// Import Vuelidate Rules
import { required, maxLength } from "vuelidate/lib/validators";
import { helpers } from "vuelidate/lib/validators";

// Content for help fields
import { scenarioOptionsHelp } from "~/assets/helpText";

export default {
  name: "ScenarioOptions",
  mixins: [User],
  components: { Tags, Shuttle, HelpSidebar },
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
        }
      }
    };
  },
  computed: {
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
    ...mapGetters({
      assetSet: "assets/assetSet"
    }),
  },
  methods: {
    setFocus(focus) {
      this.surveyFocused = focus;
    },
    ...mapActions({
      updateMeta: "scenario/updateMeta",
      saveMeta: "scenario/saveMeta",
    }),
    updateAssets(list) {
      console.log('Asset List Update: ', list);
      this.scenarioForm.assetList = list;
    },
    onSubmit() {
      this.updateMeta(this.scenarioForm);

      this.saveMeta();
      this.$parent.close();
    },
  },
};
</script>
