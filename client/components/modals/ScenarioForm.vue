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
            maxlength="30"
            required
          />
        </b-field>

        <b-field label="Description">
          <b-input
            v-model="scenarioForm.description"
            type="textarea"
            placeholder="Description"
            customClass="has-fixed-size"
            maxlength="250"
          />
        </b-field>

        <b-field
          label="Share with Others"
          class="flex-field"
          :message="
            scenarioForm.public
              ? 'You acknowledge that your scenario may be used in others\' experiments.'
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

        <b-field
          label="Citation"
          v-if="scenarioForm.public"
          message="This is how others will cite your work."
        >
          <b-input
            v-model="scenarioForm.citation"
            placeholder="e.g. Smith, J. (2020). Title of artwork [Digital]."
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
import { toCapitalCase } from "~/assets/util";

export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
    scenario: Object,
  },
  data() {
    const scenarioForm = {
      name: "",
      description: "",
      public: false,
      citation: "",
      ...this.scenario,
    };

    return {
      scenarioForm,
    };
  },
  mounted() {
    this.focus();
  },
  computed: {
    addMode() {
      return !this.scenario;
    },
    ...mapGetters({
      scenarioSet: "scenarios/scenarioSet",
    }),
  },
  methods: {
    focus() {
      this.$refs.focus_target.focus();
    },
    ...mapActions({
      addScenario: "scenarios/addScenario",
      editScenario: "scenarios/editScenario",
    }),
    onSubmit() {
      if (
        this.scenarioSet.some(
          ({ id, name }) =>
            name.toLowerCase() === this.scenarioForm.name.toLowerCase() &&
            id !== this.scenarioForm?.id
        )
      ) {
        this.$buefy.toast.open({
          message: "A scenario with the same name already exists",
          type: "is-danger",
        });

        // Clear name and re-focus on name input
        this.scenarioForm.name = "";
        this.focus();
      } else {
        // Add scenario to state
        const capitalName = toCapitalCase(this.scenarioForm.name);
        try {
          this.addMode
            ? this.addScenario({ ...this.scenarioForm, name: capitalName })
            : this.editScenario({
                ...this.scenarioForm,
                name: capitalName,
              });
        } finally {
          this.$parent.close();
        }
      }
    },
  },
};
</script>
