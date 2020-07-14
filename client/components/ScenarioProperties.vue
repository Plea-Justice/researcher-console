<template>
    <div class="card" style="width: 30vw">
      <header class="card-header">
        <p class="card-header-title">Scenario Properties</p>
      </header>
      <form @submit.prevent="onSubmit()">
      <ItemCard v-model="scenarioForm" save required>
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
            <b-input expanded
              v-model="scenarioForm.survey"
              type="text"
              class="has-fixed-size"
              placeholder="https://"
              pattern="^(https?:\/\/|\/).*"
              validation-message="Valid URL required."
              maxlength="500"
            />
            <HelpSidebar class="control"
                    title="Survey URL"
                    text="The survey URL is the web address the participant will be redirected to at the end of the
                      simulation. This may be a Qualtrics or other questionnaire or web page ready to recieve the
                      participant's data." />
          </b-field>
        </b-field>
      </ItemCard>
      </form>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import ItemCard from "~/components/cards/ItemCard";
import HelpSidebar from "~/components/HelpSidebar";
export default {
  components: { ItemCard, HelpSidebar },
  data() {
    return {
      scenarioForm: Object.assign({}, this.$store.state.scenario.meta)
    }
  },
  methods: {
    ...mapActions({
      updateMeta: "scenario/updateMeta"
    }),
    onSubmit() {
      this.updateMeta({ key: "name", val: this.scenarioForm.name });
      this.updateMeta({ key: "description", val: this.scenarioForm.description });
      this.updateMeta({ key: "survey", val: this.scenarioForm.survey });

      // TODO: This should saveScenario too. However this may interfere with validation. saveMeta?
      this.$parent.close();
    }
  }
};
</script>