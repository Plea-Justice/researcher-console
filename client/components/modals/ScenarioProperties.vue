<template>
  <div class="modal-card" style="width: 30vw">
    <form @submit.prevent="onSubmit()">
      <header class="modal-card-head">
        <p class="modal-card-title">Scenario Properties</p>
      </header>
      <section class="modal-card-body">
        <b-field label="Name">
          <b-input v-model="scenarioForm.name" />
        </b-field>

        <b-field label="Description">
          <b-input
            v-model="scenarioForm.description"
            type="textarea"
            customClass="has-fixed-size"
            placeholder="Description"
            maxlength="100"
          />
        </b-field>
        <b-field
          label="Survey URL"
          type="is-danger"
          message="Valid URL required"
        >
          <div class="field-body no-help">
            <!-- FIXME: need's external validator -->
            <b-field>
              <b-input
                v-model="scenarioForm.survey"
                :has-counter="false"
                type="text"
                placeholder="https://"
                pattern="^(https?:\/\/|\/).*"
                maxlength="500"
                expanded
              />

              <HelpSidebar
                :text="propertiesHelp.url"
                buttonType="is-dark"
                title="Survey URL"
                class="control"
              />
            </b-field>
          </div>
        </b-field>
      </section>
      <footer class="modal-card-foot">
        <b-button type="is-primary" native-type="submit" value="Save" expanded
          >Save</b-button
        >
      </footer>
    </form>
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import HelpSidebar from "~/components/HelpSidebar";

// Content for help fields
import { scenarioPropertiesHelp } from "~/assets/helpText";

export default {
  name: "ScenarioProperties",
  components: { HelpSidebar },
  data() {
    return {
      propertiesHelp: scenarioPropertiesHelp,
      scenarioForm: Object.assign({}, this.$store.state.scenario.meta)
    };
  },
  methods: {
    ...mapActions({
      updateMeta: "scenario/updateMeta"
    }),
    //FIXME: use one VueX call?
    onSubmit() {
      this.updateMeta(this.scenarioForm);

      // TODO: This should saveScenario too. However this may interfere with validation. saveMeta?
      this.$parent.close();
    }
  }
};
</script>

<style scoped>
.no-help .help {
  display: none;
}
</style>
