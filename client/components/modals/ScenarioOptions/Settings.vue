<template>
  <div>
    <form-group label="Name" :validator="$v.scenarioForm.name">
      <b-input v-model="$v.scenarioForm.name.$model" maxlength="30" />
    </form-group>

    <form-group label="Description" :validator="$v.scenarioForm.description">
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
      :message="surveyWarn.message || ''"
      v-slot="{ type }"
    >
      <b-field :type="type">
        <b-input
          v-model="$v.scenarioForm.survey.$model"
          @focus="setFocus(true)"
          @blur="setFocus(false)"
          expanded
        />
        <Help :text="optionsHelp.url" title="Survey URL" class="control" />
      </b-field>
    </form-group>

    <form-group label="Share with Others">
      <b-field
        class="flex-field"
        message="You acknowledge that your asset may be used in others' experiments."
      >
        <b-tooltip
          :active="!user.permitSharing"
          label="You're not permitted share files, request permission from an admin"
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
  </div>
</template>

<script>
// Import Components
import Help from "~/components/modals/Help";

// Import Mixins
import User from "~/mixins/User";

// Import Vuelidate Rules
import { required, maxLength } from "vuelidate/lib/validators";
import { helpers } from "vuelidate/lib/validators";

// Content for help fields
import { scenarioOptionsHelp } from "~/assets/helpText";

export default {
  mixins: [User],
  components: { Help },
  props: {
    scenarioMeta: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      optionsHelp: scenarioOptionsHelp,
      surveyFocused: false,
      scenarioForm: Object.assign({}, this.scenarioMeta),
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
    surveyWarn() {
      let status = false;
      if (this.scenarioForm.survey === "") {
        status = {
          type: "is-warning",
          message: "Insert a link to your Qualtrics survey",
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
    async onSubmit() {
      console.log("Submit Called");

      await this.$v.scenarioForm.$touch();
      if (this.$v.scenarioForm.$invalid) {
        this.$buefy.toast.open({
          message: "Please fix any invalid fields to save",
          type: "is-danger",
          duration: 2000,
        });
      } else {
        this.$emit("close");
      }
    },
  },
};
</script>
