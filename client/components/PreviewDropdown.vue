<template>
<div class="buttons">
  <ToolBarButton
                @click="previewSimulation()"
                type="is-primary"
                icon-left="eye"
              >Preview</ToolBarButton>
  <b-dropdown>
            <ToolBarButton class="button is-primary" slot="trigger" icon-left="angle-down"
            >Publish</ToolBarButton>

            <b-dropdown-item @click="downloadZip">Download</b-dropdown-item>
            <b-dropdown-item :disabled="!user.permitHosting">Publish</b-dropdown-item>
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
          onConfirm: () => setTimeout(this.$emit('openScenarioProps'), 150)
        });
      } else {
        this.snackbar = this.$buefy.snackbar.open({
          message: "Please wait, generating simulation...",
          position: "is-top",
          indefinite: true,
          actionText: null
        });

        try {
          const res = await this.$axios.post(
            `/api/v1/scenarios/${this.scenarioMeta.id}/generate`
          );
          status = res.status === 200;
        } catch (err) {
          status = false;
        }

        this.closeSnackbar();
      }

      return status;
    },
    async downloadZip() {
      if (!(await this.generateSimulation())) return;
      this.snackbar = this.$buefy.snackbar.open({
        message: "Preparing simulation ZIP...",
        position: "is-top",
        indefinite: true,
        actionText: null
      });

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

      this.closeSnackbar();
    },
    async previewSimulation() {
      if (!(await this.generateSimulation())) return;
      this.$buefy.toast.open({
        message: "Preview ready.",
        type: "is-success"
      });

      window.open(
        `${this.$axios.defaults.baseURL}/sim-serve/sim-${this.scenarioMeta.id}/`
      );
    },
    closeSnackbar() {
      this.snackbar.close();
      this.snackbar = null;
    }
  }
};
</script>
