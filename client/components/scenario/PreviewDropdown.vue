<template>
  <div class="buttons">
    <ToolBarButton
      @click="preview"
      :loading="previewState.loading"
      :type="previewState.type('is-primary')"
      :icon-left="previewState.icon('eye')"
    >
      Preview
    </ToolBarButton>
    <b-dropdown position="is-bottom-left">
      <ToolBarButton
        slot="trigger"
        slot-scope="{ active }"
        :icon-left="publishState.icon(active ? 'angle-up' : 'angle-down')"
        :loading="publishState.loading"
        :type="publishState.type('is-primary')"
      >
        Publish
      </ToolBarButton>

      <b-dropdown-item @click="download">Manual Download</b-dropdown-item>
      <b-dropdown-item @click="publish" :disabled="!user.permitHosting">
        Publish Live
      </b-dropdown-item>
      <b-dropdown-item v-if="scenarioMeta.live" @click="liveURLPopup">
        <b-tag type="is-success">Active Live Link</b-tag>
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
// Import VueX
import { mapActions, mapGetters } from "vuex";

// Import Mixins
import User from "~/mixins/User";
// import ButtonState from "~/mixins/ButtonState";

// Import Components
import ToolBarButton from "~/components/ToolBarButton";
import SimulationLink from "~/components/modals/SimulationLink";

export default {
  components: { ToolBarButton, SimulationLink },
  mixins: [User],
  props: {
    scenarioMeta: {
      type: Object,
      required: true,
    },
    parent: {
      type: Object,
    },
  },
  data() {
    const ButtonStatus = {
      NORMAL: 0,
      ERROR: 1,
      SUCCESS: 2,
    };

    class ButtonState {
      constructor() {
        (this.loading = false), (this.status = ButtonStatus.NORMAL);
      }

      type(baseType = "") {
        let type = baseType;
        if (this.status === ButtonStatus.ERROR) type = "is-danger";
        else if (this.status === ButtonStatus.SUCCESS) type = "is-success";
        return type;
      }

      icon(baseIcon = "") {
        let icon = baseIcon;
        if (this.status === ButtonStatus.ERROR) icon = "times";
        else if (this.status === ButtonStatus.SUCCESS) icon = "check";
        return icon;
      }

      setTempStatus(status, duration = 2000) {
        if (this.loading) this.loading = false;
        this.status = status;

        setTimeout(() => {
          this.status = ButtonStatus.NORMAL;
        }, duration);
      }
    }

    return {
      ButtonStatus,
      previewState: new ButtonState(),
      publishState: new ButtonState(),
    };
  },
  computed: {
    ...mapGetters({
      scenarioStatus: "scenario/status",
    }),
  },
  methods: {
    ...mapActions({
      updateMeta: "scenario/updateMeta",
      saveMeta: "scenario/saveMeta",
    }),
    async preview() {
      // TODO: Ask on unsaved, invalid, etc.
      // Create an array of warnings & display the messages accordingly
      if (!this.scenarioMeta.survey) {
        // FIXME: Make this a component
        this.$buefy.dialog.confirm({
          title: "Survey Redirect Not Set",
          message:
            'Please set the survey URL found under the "Options" Toolbar Button',
          type: "is-warning",
          hasIcon: true,
          icon: "exclamation-triangle",
          cancelText: "Close",
          confirmText: "Open Scenario Options",
          onConfirm: () => setTimeout(this.$emit("openScenarioOptions"), 150),
        });
      } else {
        this.previewState.loading = true;

        let loadingToast = null;
        let cancel = false;
        setTimeout(() => {
          if (!cancel)
            loadingToast = this.$buefy.toast.open({
              duration: 2000,
              message: "Generating Preview...",
              type: "is-info",
            });
        }, 100);

        try {
          const res = await this.$axios.post(
            `/api/v1/scenarios/${this.scenarioMeta.id}/preview`
          );

          cancel = true;
          loadingToast?.close();
          this.previewState.setTempStatus(this.ButtonStatus.SUCCESS);
          this.$buefy.toast.open({
            duration: 2000,
            message: "Preview ready, check that pop-ups are enabled.",
            type: "is-success",
          });

          window.open(`${process.env.API_URL}/sim-prev/sim-${this.scenarioMeta.id}/`,);

        } catch (error) {
          cancel = true;
          loadingToast?.close();
          this.previewState.setTempStatus(this.ButtonStatus.ERROR);
        }
      }
    },
    async download() {
      this.publishState.loading = true;

      let loadingToast = null;
      let cancel = false;
      setTimeout(() => {
        if (!cancel)
          loadingToast = this.$buefy.toast.open({
            duration: 2000,
            message: "Compressing simulation for download...",
            type: "is-info",
          });
      }, 100);

      try {
        await this.$axios.post(
          `/api/v1/scenarios/${this.scenarioMeta.id}/download`
        );

        // FIXME: succesful return needs to be tested
        cancel = true;
        this.publishState.setTempStatus(this.ButtonStatus.SUCCESS);
        this.$buefy.toast.open({
          queue: false,
          duration: 2000,
          message: "Download ready, check that pop-ups are enabled.",
          type: "is-success",
        });
        window.open(
          `${process.env.API_URL}/sim-prev/sim-${this.scenarioMeta.id}.zip`
        );
      } catch (err) {
        console.log(err);

        cancel = true;
        loadingToast?.close();
        this.publishState.setTempStatus(this.ButtonStatus.ERROR);
      }
    },
    async publish(title, message, method, url, data) {
      this.$buefy.dialog.prompt({
        title: "Publish Simulation",
        message:
          "This action will overwrite any previously published simulations. Enter your password to confirm.",
        type: "is-warning",
        inputAttrs: {
          type: "password",
          placeholder: "Password",
          maxlength: 100,
        },
        trapFocus: true,
        onConfirm: async (pass) => {
          let loadingToast = null;
          let cancel = false;
          setTimeout(() => {
            if (!cancel)
              loadingToast = this.$buefy.toast.open({
                duration: 2000,
                message: "Preparing live simulation...",
                type: "is-info",
              });
          }, 100);

          try {
            await this.$axios.post(
              `/api/v1/scenarios/${this.scenarioMeta.id}/publish`,
              { password: pass }
            );

            let cancel = true;
            loadingToast?.close();
            this.$buefy.toast.open({
              message: "Live simulation ready.",
              type: "is-success",
            });

            this.updateMeta({
              live: `${process.env.LIVE_URL}/sim-${this.scenarioMeta.id}/simulation.html`,
            });
            this.saveMeta();

            this.liveURLPopup();
          } catch (err) {
            console.log(err);

            let cancel = true;
            loadingToast?.close();
            this.publishState.setTempStatus(this.ButtonStatus.ERROR);
          }
        },
      });
    },
    liveURLPopup() {
      if (this.scenarioMeta.live) {
        this.$buefy.modal.open({
          parent: this,
          component: SimulationLink,
          hasModalCard: true,
          trapFocus: true,
          props: {
            url: this.scenarioMeta.live,
          },
        });
      }
    },
    /*
    async wrapSnackbar(callback, message) {
      if (!this.scenarioStatus.valid) {
        this.$emit("goToErrors");
      } else {
        this.snackbar = this.$buefy.snackbar.open({
          message: message,
          position: "is-top",
          indefinite: true,
          actionText: null,
        });

        await callback();
        this.snackbar.close();
        this.snackbar = null;
      }
    },
    */
  },
};
</script>
