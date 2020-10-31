<template>
  <div class="buttons">
    <ToolBarButton @click="preview" type="is-primary" icon-left="eye"
      >Preview</ToolBarButton
    >
    <b-dropdown position="is-bottom-left">
      <ToolBarButton
        class="button is-primary"
        slot="trigger"
        icon-left="angle-down"
        >Publish</ToolBarButton
      >

      <b-dropdown-item @click="download">Manual Download</b-dropdown-item>
      <b-dropdown-item @click="publish" :disabled="!user.permitHosting"
        >Publish Live</b-dropdown-item
      >
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
import User from "~/mixins/user";

// Import Components
import ToolBarButton from "~/components/ToolBarButton";

export default {
  components: { ToolBarButton },
  mixins: [User],
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
    ...mapGetters({
      scenarioStatus: "scenario/status"
    })
  },
  methods: {
    ...mapActions({
      updateMeta: "scenario/updateMeta",
      saveMeta: "scenario/saveMeta"
    }),
    async preview() {
      // TODO: Ask on unsaved, invalid, etc.
      // Create an array of warnings & display the messages accordingly
      if (!this.scenarioMeta.survey) {
        this.$buefy.dialog.alert({
          title: "Survey Redirect Not Set",
          message:
            'Please set the survey URL. This can be found under the "Options" Toolbar Button',
          type: "is-warning",
          hasIcon: true,
          icon: "exclamation-triangle",
          onConfirm: () => setTimeout(this.$emit("openScenarioOptions"), 150)
        });
      } else {
        await this.wrapSnackbar(async () => {
          try {
            const res = await this.$axios.post(
              `/api/v1/scenarios/${this.scenarioMeta.id}/preview`
            );

            this.$buefy.toast.open({
              message: "Preview ready. Check that pop-ups are enabled.",
              type: "is-success"
            });

            window.open(
              `${process.env.API_URL}/sim-prev/sim-${this.scenarioMeta.id}/`
            );
          } catch (err) {
            console.log(err);
          }
        }, "Please wait, generating preview...");
      }
    },
    async download() {
      await this.wrapSnackbar(async () => {
        try {
          await this.$axios.post(
            `/api/v1/scenarios/${this.scenarioMeta.id}/download`
          );

          this.$buefy.toast.open({
            message: "Download ready. Check that pop-ups are enabled.",
            type: "is-success"
          });

          window.open(
            `${process.env.API_URL}/sim-prev/sim-${this.scenarioMeta.id}.zip`
          );
        } catch (err) {
          console.log(err);
        }
      }, "Compressing simulation for download...");
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
          maxlength: 100
        },
        trapFocus: true,
        onConfirm: async pass => {
          this.wrapSnackbar(async () => {
            try {
              await this.$axios.post(
                `/api/v1/scenarios/${this.scenarioMeta.id}/publish`,
                {
                  password: pass
                }
              );

              this.$buefy.toast.open({
                message: "Live simulation ready.",
                type: "is-success"
              });

              this.updateMeta({
                live: `${process.env.LIVE_URL}/sim-${this.scenarioMeta.id}/simulation.html`
              });
              this.saveMeta();

              this.liveURLPopup();
            } catch (err) {
              console.log(err);
            }
          }, "Preparing live simulation...");
        }
      });
    },
    liveURLPopup() {
      if (this.scenarioMeta.live) {
        this.$buefy.dialog.alert({
          title: "Live Simulation Link",
          message: `This scenario has been published at: <br /><br />
            <a class="is-size-7" href="${this.scenarioMeta.live}">${this.scenarioMeta.live}</a><br /><br />
            This simulation link may be copied to a Qualtrics survey end block along with the required parameters
            described <a href="https://pleajustice.org/simulation/working-with-qualtrics">here</a>.<br /><br />
            Opening the link directly without these parameters will result in an error.`,
          type: "is-success"
        });
      }
    },
    async wrapSnackbar(callback, message) {
      if (!this.scenarioStatus.valid) {
        this.$emit("gotoErrors");
      } else {
        this.snackbar = this.$buefy.snackbar.open({
          message: message,
          position: "is-top",
          indefinite: true,
          actionText: null
        });

        await callback();
        this.snackbar.close();
        this.snackbar = null;
      }
    }
  }
};
</script>
