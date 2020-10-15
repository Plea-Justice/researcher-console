<template>
  <ScenarioLayout ref="layout" :title="scenarioMeta.name" :logout="onLogout">
    <template ref="header">
      <ToolBar ref="toolbar">
        <template v-slot:start>
          <p class="level-item">Scenes: {{ numScenes }}</p>
          <div class="level-item buttons">
            <ToolBarButton
              @click="saveHelper()"
              :value="mode"
              :loading="saving"
              :label="saveState.text"
              :type="saveState.type"
              :icon-left="saveState.icon"
              style="min-width: 69px"
            />

            <ToolBarButton
              @click="openScenarioOptions()"
              :value="mode"
              icon-left="cog"
              >Options</ToolBarButton
            >

            <b-button
              @click="collapseAll()"
              :icon-left="`${collapsed ? 'expand' : 'compress'}-alt`"
              :disabled="numScenes < 1"
            />
          </div>

          <div class="level-item buttons">
            <ToolBarButton
              @click="addCondition()"
              :value="mode"
              :disabled="!numScenes"
              >Add Condition</ToolBarButton
            >
          </div>

          <div class="level-item buttons">
            <ToolBarButton
              v-model="mode"
              @click="toggleHandler($event, 'swap')"
              :mode="Modes.SWAP"
              :disabled="numScenes < 2"
              >Swap</ToolBarButton
            >

            <ToolBarButton
              v-model="mode"
              @click="toggleHandler($event, 'copy')"
              :mode="Modes.COPY"
              :disabled="numScenes < 2"
              >Copy</ToolBarButton
            >

            <ToolBarButton
              v-model="mode"
              @click="toggleHandler($event, 'bind')"
              :mode="Modes.BIND"
              :disabled="numScenes < 2"
              >Bind</ToolBarButton
            >
          </div>
        </template>

        <template v-slot:end>
          <div class="level-item">
            <PreviewDropdown
              :scenarioMeta="scenarioMeta"
              @gotoErrors="goToErrors()"
              @openScenarioOptions="openScenarioOptions"
            />
          </div>
        </template>
      </ToolBar>

      <ConditionBar
        ref="conditionbar"
        @remove="removeConditionHelper($event)"
        @selected="addToSelection($event, Select.CONDITION)"
        :selectable="isSelectable(Select.CONDITION)"
      />
    </template>

    <p>{{ scenarioStatus }}</p>

    <section ref="frames" class="padded-responsive-container responsive-center">
      <!-- Frames -->
      <SceneFrame
        v-for="(frame, index) in frameSet"
        :key="`${frame.id}`"
        @scroll-to="scrollToFrame($event)"
        @selected="addToSelection($event, Select.SCENE)"
        :selectable="isSelectable(Select.SCENE)"
        :frame="frame"
        :frameIndex="index"
        :isFirst="index === 0"
        :isLast="index === frameSet.length - 1"
      />
    </section>
  </ScenarioLayout>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Bus
import { Event } from "~/bus/eventbus";

// Import Components
import ScenarioLayout from "~/components/layouts/ScenarioLayout";
import ToolBar from "~/components/ToolBar";
import ToolBarButton from "~/components/ToolBarButton";
import ConditionBar from "~/components/scenario/ConditionBar";
import SceneFrame from "~/components/scenario/SceneFrame";
import PreviewDropdown from "~/components/scenario/PreviewDropdown";
import ScenarioOptions from "~/components/modals/ScenarioOptions";
import LeaveScenario from "~/components/modals/LeaveScenario";

import SelectionMixin from "~/mixins/SelectionMixin";

// Content for help fields
import { scenarioHelp } from "~/assets/helpText";

export default {
  name: "Scenario",
  components: {
    ScenarioLayout,
    ToolBar,
    ToolBarButton,
    ConditionBar,
    SceneFrame,
    ScenarioOptions,
    PreviewDropdown
  },
  mixins: [SelectionMixin],
  data() {
    return {
      // import from JS file
      scenarioHelp: scenarioHelp,

      // **** Created() ****
      // Track VueX Subscription
      scenarioStoreHasChanged: false,
      headerHeight: 0,

      saving: false,
      saveStatus: {
        valid: {
          type: "is-success",
          icon: "check"
        },
        invalid: {
          type: "is-danger",
          icon: "times"
        },
        changed: {
          type: "is-warning",
          text: "Save"
        }
      },

      collapsed: false,
      logout: false,
      snackbar: null
    };
  },
  async fetch({ store, params }) {
    await Promise.all([
      store.dispatch("scenario/getScenario", params.id),
      store.dispatch("assets/getAssets")
    ]);
  },
  created() {
    // FIXME: keep better track of dirty state
    this.$store.subscribe((mutation, state) => {
      if (this.scenarioStoreHasChanged) {
        // If state has changed set to false if saving
        if (mutation.type === "scenario/putScenario")
          this.scenarioStoreHasChanged = false;
      } else if (
        mutation.type.startsWith("scenario/") &&
        !mutation.type !== "scenario/setScenario"
      ) {
        // Otherwise for any mutation except... mark state has changed
        this.scenarioStoreHasChanged = true;
      }
    });
  },
  mounted() {
    // Define header height
    this.headerHeight =
      this.$refs.toolbar.$el.clientHeight +
      this.$refs.conditionbar.$el.clientHeight;
  },
  computed: {
    ...mapGetters({
      scenarioMeta: "scenario/scenarioMeta",
      scenarioStatus: "scenario/status",
      numScenes: "scenario/numScenes",
      frameSet: "scenario/frameSet"
    }),
    saveState() {
      if (!this.scenarioStatus.valid) return this.saveStatus.invalid;
      else if (this.scenarioStoreHasChanged) return this.saveStatus.changed;
      else if (this.scenarioStatus.valid && !this.scenarioStoreHasChanged)
        return this.saveStatus.valid;
      else return { type: "is-primary" };
    }
  },
  methods: {
    findScene(sceneId) {
      let indexPair = null;
      for (const [index, { scenes }] of this.frameSet.entries()) {
        const sceneIndex = scenes.indexOf(sceneId);
        if (sceneIndex !== -1) {
          indexPair = { frame: index, scene: sceneIndex };
          break;
        }
      }
      return indexPair;
    },
    goToErrors() {
      const { frameErrors, sceneErrors } = this.scenarioStatus;
      const numErrors = frameErrors.length + sceneErrors.length;

      if (numErrors) {
        let message = "";
        let frameScrollIndex = null;

        if (frameErrors.length) {
          const errorIndex = this.frameSet.findIndex(
            frame => frame.id === frameErrors[0]
          );
          message = `row ${errorIndex} scenes label`;
          frameScrollIndex = errorIndex;
        } else {
          const errorIndex = this.findScene(sceneErrors[0]);
          message = `scene ${errorIndex.scene + 1} of current row`;
          frameScrollIndex = errorIndex.frame;
        }

        this.$buefy.toast.open({
          message: `${numErrors} ${
            numErrors > 1 ? "errors exists, starting" : "error exists"
          } at ${message}`,
          type: "is-danger"
        });
        this.scrollToFrame({ frameIndex: frameScrollIndex });
      }
    },
    async saveHelper() {
      if (this.scenarioStoreHasChanged) {
        this.saving = true;
        if (this.scenarioStatus.valid) {
          await this.saveScenario();
          this.scenarioStoreHasChanged = false;
          this.$buefy.toast.open({
            message: "Scenario Saved",
            type: "is-success"
          });
        } else {
          this.goToErrors();
        }
        this.saving = false;
      } else {
        this.$buefy.toast.open({
          message: "Scenario is already up to date",
          type: "is-info"
        });
      }
    },
    collapseAll() {
      this.collapsed = !this.collapsed;
      Event.collapseAll(this.collapsed);
    },
    closeSnackbar() {
      this.snackbar.close();
      this.snackbar = null;
    },
    toggleHandler(toggledOn, modeName) {
      if (toggledOn) {
        this.snackbar = this.$buefy.snackbar.open({
          message: this.modeOptions[this.mode].messages[0],
          position: "is-top",
          indefinite: true,
          type: "is-danger",
          actionText: "Cancel",
          onAction: () => {
            if (this.selectionList.length >= 2)
              this.modeOptions[this.mode].actions[this.select](
                this.selectionList
              );
            this.selectionReset();
            this.mode = this.Modes.DEFAULT;
          }
        });

        this.select = this.modeOptions[this.mode].type;
      } else {
        this.closeSnackbar();
        this.selectionReset();
      }
    },
    scrollToFrame({ frameIndex, smooth = true }) {
      this.$nextTick(() => {
        const frameTopPos = this.$refs.frames.children[
          frameIndex
        ].getBoundingClientRect().top;

        // Scroll so that the element is at the top of the view
        const scrollElement = this.$refs.layout.$refs.scroll;

        scrollElement.scrollTo({
          top: frameTopPos - this.headerHeight + scrollElement.scrollTop,
          ...(smooth && { behavior: "smooth" })
        });
      });
    },
    openScenarioOptions() {
      this.$buefy.modal.open({
        parent: this,
        component: ScenarioOptions,
        hasModalCard: true,
        trapFocus: true
      });
    },
    logoutHelper() {
      this.logout = true;
      this.$auth.logout();
    },
    ...mapActions({
      addCondition: "scenario/addCondition",
      removeCondition: "scenario/removeCondition",
      saveScenario: "scenario/saveScenario"
    }),
    removeConditionHelper(id) {
      const scrollElement = this.$refs.layout.$refs.scroll;
      scrollElement.scrollTo({
        // FIXME: have scene sizes reference the Buefy variables somehow
        left: scrollElement.scrollLeft - (350 + 20)
      });
      this.removeCondition(id);
    },
    LeaveScenarioHelper(exitAction) {
      this.$buefy.modal.open({
        parent: this,
        component: LeaveScenario,
        props: { valid: this.scenarioStatus.valid },
        events: { exit: exitAction },
        hasModalCard: true,
        customClass: "dialog",
        trapFocus: true
      });
    },
    onLogout() {
      if (this.scenarioStoreHasChanged) {
        this.LeaveScenarioHelper(this.logoutHelper);
      } else {
        this.logoutHelper();
      }
    }
  },
  beforeRouteLeave(to, from, next) {
    this.snackbar && this.closeSnackbar();

    if (!this.logout && this.scenarioStoreHasChanged) {
      this.LeaveScenarioHelper(next);
    } else {
      next();
    }
  }
};
</script>

<style lang="scss" scoped>
// Toolbar button group spacing
.level-item.buttons {
  margin-bottom: 0;
  margin-right: 2rem;

  & > .button {
    margin-bottom: 0;
  }
}

.responsive-center {
  max-width: max-content;
  margin-left: auto;
  margin-right: auto;
}
</style>
