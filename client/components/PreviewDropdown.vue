<template>
  <div class="buttons">
    <ToolBarButton
      @click="previewSimulation()"
      type="is-primary"
      icon-left="eye"
      >Preview</ToolBarButton
    >
    <b-dropdown position="is-bottom-left">
      <ToolBarButton
        class="button is-primary"
        slot="trigger"
        icon-left="angle-down"
        >Publish</ToolBarButton
      >

      <b-dropdown-item @click="downloadZip">Manual Download</b-dropdown-item>
      <b-dropdown-item @click="publishSimulation" :disabled="!user.permitHosting" >Publish Live</b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
import ToolBarButton from "~/components/ToolBarButton";

export default {
  components: {
    ToolBarButton
  },
  props: {
    scenarioMeta: {
      type: Object,
      required: true
    },
    parent: {
      type: Object
    }
  },
  data() {
    return {
      defaultMode: this.value
    };
  },
  computed: {
    user() {
      return this.$auth.user ? this.$auth.user : { name: "dev", n_sessions: 1 };
    }
  },
  methods: {
    async generateSimulation() {
      // TODO: Ask on unsaved, invalid, etc.
      // Create an array of warnings & display the messages accordingly
      let status = false;
      if (!this.scenarioMeta.survey) {
        this.$buefy.dialog.alert({
          title: "Survey Redirect Not Set",
          message:
            'Please set the survey URL. This can be found under the "Options" Toolbar Button',
          type: "is-warning",
          hasIcon: true,
          icon: "exclamation-triangle",
          onConfirm: () => setTimeout(this.$emit("openScenarioProps"), 150)
        });
      } else {
        this.wrapSnackbar(async () => {
        try {
          const res = await this.$axios.post(
            `/api/v1/scenarios/${this.scenarioMeta.id}/generate`
          );
          status = res.status === 200;
        } catch (err) {
          status = false;
        }
        }, "Please wait, generating simulation...");
      }

      return status;
    },
    async downloadZip() {
      if (!(await this.generateSimulation())) return;
      this.wrapSnackbar(async () => {
      try {
        const res = await this.$axios.post(
          `/api/v1/scenarios/${this.scenarioMeta.id}/zip`
        );
        if (res.status === 200)
          window.open(
            `${this.$axios.defaults.baseURL}/sim-serve/sim-${this.scenarioMeta.id}.zip`
          );
      } catch (err) {
        console.log(err);
      }
      }, "Compressing simulation for download...");
    },
    async previewSimulation() {
      if (!(await this.generateSimulation())) return;
      this.$buefy.toast.open({
        message: "Preview ready. Check that pop-ups are enabled.",
        type: "is-success"
      });

      window.open(
        `${this.$axios.defaults.baseURL}/sim-serve/sim-${this.scenarioMeta.id}/`
      );
    },
    async publishSimulation() {
      await this.$axios.post(`/api/v1/scenarios/${this.scenarioMeta.id}/publish`)
    },
    wrapSnackbar(callback, message) {
      this.snackbar = this.$buefy.snackbar.open({
        message: message,
        position: "is-top",
        indefinite: true,
        actionText: null
      });

      callback().then(()=>{
      this.snackbar.close();
      this.snackbar = null;
      });

      
    }
  }
};
</script>
