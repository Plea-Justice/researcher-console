<template>
  <div class="modal-card" style="width: 30vw">
    <form @submit.prevent="onSubmit()">
      <header class="modal-card-head">
        <p class="modal-card-title">Add Scenario</p>
      </header>
      <section class="modal-card-body">
        <b-field label="Scenario Name">
          <b-input
            ref="focus_target"
            v-model="scenarioForm.name"
            placeholder="Name"
            class="flex-grow"
            required
          />
        </b-field>

        <b-field label="Description">
          <b-input
            v-model="scenarioForm.description"
            type="textarea"
            placeholder="Description"
            customClass="has-fixed-size"
            maxlength="100"
          />
        </b-field>
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

// Import Utils
import { toPascalCase } from "~/assets/util";

export default {
  props: {
    scenario: Object
  },
  data() {
    const scenarioForm = {
      name: "",
      description: "",
      ...this.scenario
    }

    return {
      scenarioForm
    };
  },
  mounted() {
    this.focus();
  },
  computed: {
    addMode() {
      return !this.scenario
    },
    ...mapGetters({
      scenarioSet: "scenarios/scenarioSet"
    })
  },
  methods: {
    focus() {
      this.$refs.focus_target.focus();
    },
    ...mapActions({
      addScenario: "scenarios/addScenario",
      editScenario: "scenarios/editScenario"
    }),
    onSubmit() {
      if (
        this.scenarioSet.some(
          ({ id, name }) =>
            name.toLowerCase() === this.scenarioForm.name.toLowerCase()
            && id !== this.scenarioForm?.id
        )
      ) {
        this.$buefy.toast.open({
          message: "A scenario with the same name already exists",
          type: "is-danger"
        });

        // Clear name and re-focus on name input
        this.scenarioForm.name = "";
        this.focus();
      } else {
        // Add scenario to state
        const pascalName = toPascalCase(this.scenarioForm.name);
        try {
          this.addMode
            ? this.addScenario({ ...this.scenarioForm, name: pascalName })
            : this.editScenario({
                ...this.scenarioForm,
                name: pascalName,
              })

          this.$parent.close();
        } catch (error) {}
      }
    }
  }
};
</script>
