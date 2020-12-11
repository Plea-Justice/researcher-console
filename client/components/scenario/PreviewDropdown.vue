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
import ButtonStateMixin, { ButtonState } from "~/mixins/ButtonState";

// Import Components
import ToolBarButton from "~/components/ToolBarButton";
import SimulationLink from "~/components/modals/SimulationLink";

export default {
  components: { ToolBarButton, SimulationLink },
  mixins: [User, ButtonStateMixin],
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
    return {
      previewState: null,
      publishState: null,
    };
  },
  created() {
    this.previewState = new ButtonState(this.ButtonStatus);
    this.publishState = new ButtonState(this.ButtonStatus);
  },
  computed: {
    ...mapGetters({
      scenarioStatus: "scenario/status",
    }),
  },
  methods: {
    ...mapActions({
      updateMeta: "scenario/updateMeta",
    }),
    async preview() {
      // TODO: Ask on unsaved, invalid, etc.
      // Create an array of warnings & display the messages accordingly
      if (!this.scenarioMeta.survey) {
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

          window.open(
            `${process.env.API_URL}/sim-prev/sim-${this.scenarioMeta.id}/`
          );
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
        const response = await this.$axios.post(
          `/api/v1/scenarios/${this.scenarioMeta.id}/download`
        );
      } finally {
        this.cancel = true;
        this.loadingToast?.close();

        this.publishState.setTempStatus(
          response.success ? this.ButtonStatus.SUCCESS : this.ButtonStatus.ERROR
        );

        if (response.success) {
          this.$buefy.toast.open({
            queue: false,
            duration: 2000,
            message: "Download ready, check that pop-ups are enabled.",
            type: "is-success",
          });

          window.open(
            `${process.env.API_URL}/sim-prev/sim-${this.scenarioMeta.id}.zip`
          );
        }
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
            const response = await this.$axios.post(
              `/api/v1/scenarios/${this.scenarioMeta.id}/publish`,
              { password: pass }
            );

            this.updateMeta({
              live: `${process.env.LIVE_URL}/sim-${this.scenarioMeta.id}/simulation.html`,
            });

            this.liveURLPopup();
          } finally {
            let cancel = true;
            loadingToast?.close();

            this.publishState.setTempStatus(
              response.success
                ? this.ButtonStatus.SUCCESS
                : this.ButtonStatus.ERROR
            );

            if (response.success) {
              this.$buefy.toast.open({
                message: "Live simulation ready.",
                type: "is-success",
              });
            }
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
  },
};
</script>
