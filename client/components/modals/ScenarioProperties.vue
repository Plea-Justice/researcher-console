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
            class="has-fixed-size"
            placeholder="Description"
            maxlength="100"
          />
        </b-field>
        <b-field label="Survey URL">
          <b-field>
            <b-input
              expanded
              v-model="scenarioForm.survey"
              type="text"
              class="has-fixed-size"
              placeholder="https://"
              pattern="^(https?:\/\/|\/).*"
              validation-message="Valid URL required."
              maxlength="500"
            />
            <HelpSidebar
              :text="propertiesHelp.url"
              buttonType="is-light"
              title="Survey URL"
              class="control"
            />
          </b-field>
        </b-field>
      </section>
      <footer class="modal-card-foot">
        <b-button type="is-primary" native-type="submit" value="Save" expanded>Save</b-button>
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
