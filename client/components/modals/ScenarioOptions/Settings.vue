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
        maxlength="250"
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
    <div v-if="isOwner">
      <form-group label="Share with Others">
        <b-field
          class="flex-field"
          message="You acknowledge that your scenario may be used in others' experiments."
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

      
      <form-group label="Add a Collaborator">
        <b-field>
          <b-input
            v-model="collabId"
            placeholder="User's email"
            @focus="setFocus(true)"
            @blur="setFocus(false)"
            expanded/>
            <b-button @click="addCollab()" type="is-dark" icon-left="user-plus"
            style="border-radius: 0px 4px 4px 0px;"/>
        </b-field>
        
      </form-group>
      <li v-for="collaborator in collabEmails" v-bind:key="collaborator"> 
            {{ collaborator }}
            <b-button 
            style="float:right;" 
            @click="removeCollab(collaborator)"  
            type="is-danger is-light" 
            icon-left="times-circle" 
            size="is-small"/>
      </li>
    </div>
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import Help from "~/components/modals/Help";
;

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
    id: String,
  },
  data() {
    return {
      optionsHelp: scenarioOptionsHelp,
      surveyFocused: false,
      scenarioForm: Object.assign({}, this.scenarioMeta),
      collaborators: [...this.scenarioMeta.collaborators],
      collabEmails: [],
      collabId: '',
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
          maxLength: maxLength(250),
        },
        survey: {
          url,
        },
      },
    };
  },
  mounted(){
    this.collaborators.forEach(async element => {
      const response = await this.$axios.$get(`/api/v1/scenarios/id/${element}`);
      this.collabEmails.push(response);
    })
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
    isOwner() {
      return !this.scenarioMeta.collaborators.includes(this.id);
    }
  },
  methods: {
    ...mapActions({
      updateMeta: "scenario/updateMeta",
    }),
    setFocus(focus) {
      this.surveyFocused = focus;
    },
    async onSubmit() {
      await this.$v.scenarioForm.$touch();
      if (this.$v.scenarioForm.$invalid) {
        this.$buefy.toast.open({
          message: "Please fix any invalid fields to save",
          type: "is-danger",
          duration: 2000,
        });
      } else {
        this.updateMeta(this.scenarioForm)
        this.$emit("close");
      }
    },
    async addCollab(){
      if(this.collabId != ""){
        const response = await this.$axios.$get(`/api/v1/scenarios/email/${this.collabId}`);
  
        if(this.collaborators.indexOf(response) !== -1){
          this.$buefy.toast.open({
            message: "User already added as a Collaborator",
            type: "is-danger",
            duration: 2000,
          });
        }
        else if( response === this.id){
          this.$buefy.toast.open({
            message: "Cannot add yourself as a Collaborator",
            type: "is-danger",
            duration: 2000,
          });
        }
        else if( response !== "") {
          this.collaborators = [...this.collaborators, response];
          this.collabEmails.push(this.collabId);
          this.scenarioForm.collaborators = this.collaborators;
          this.updateMeta(this.scenarioForm);
          this.$buefy.toast.open({
              message: 'Successfully added user',
              type: "is-success"
          });
        }
        else {
          this.$buefy.toast.open({
            message: "User doesn't exist",
            type: "is-danger",
            duration: 2000,
          });
        }
        this.collabId = "";
      }
    },
    removeCollab(collab){
      this.$buefy.dialog.confirm({
          message: 'Are you sure you want to remove ' + collab +'?',
          onConfirm: () => {
            let array = [...this.collaborators];
            array.splice(this.collabEmails.indexOf(collab), 1);
            this.collaborators = [...array];
            this.collabEmails.splice(this.collabEmails.indexOf(collab), 1);
            this.scenarioForm.collaborators = [...this.collaborators];
            this.updateMeta(this.scenarioForm);
            this.$buefy.toast.open({
              message: 'Successfully removed',
              type: "is-success"
            });
          }
      })
      
    },
  },
};
</script>
