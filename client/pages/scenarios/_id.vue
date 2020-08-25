<template>
  <ScenarioLayout ref="layout" :title="scenarioMeta.name" :logout="onLogout">
    <template ref="header">
      <ToolBar ref="toolbar" class="horizontal-sticky">
        <template v-slot:start>
          <p class="level-item">Scenes: {{ numScenes }}</p>
          <div class="level-item buttons">
            <ToolBarButton
              @click="saveHelper()"
              :value="mode"
              :loading="saving"
              type="is-primary is-dark"
              >Save</ToolBarButton
            >

            <ToolBarButton
              @click="openScenarioProps()"
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
          <div v-if="scenarioStoreHasChanged" class="level-item">
            <b-tag type="is-warning">Unsaved changes</b-tag>
          </div>

          <div class="level-item">
            <PreviewDropdown
              :scenarioMeta="scenarioMeta"
              @openScenarioProps="openScenarioProps"
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
    // FIXME: keep better track of dirty state instead
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
      sceneErrors: "scenario/errors",
      numScenes: "scenario/numScenes",
      frameSet: "scenario/frameSet"
    })
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
    async saveHelper() {
      if (this.scenarioStoreHasChanged) {
        this.saving = true;
        const numErrors = this.sceneErrors.length;
        if (numErrors > 0) {
          const errorIndex = this.findScene(this.sceneErrors[0]);
          if (errorIndex) {
            this.$buefy.toast.open({
              message: `${numErrors} ${
                numErrors > 1 ? "errors exists, starting" : "error exists"
              } at scene ${errorIndex.scene + 1} of current row`,
              type: "is-danger"
            });
            this.scrollToFrame({ frameIndex: errorIndex.frame });
          }
        } else {
          await this.saveScenario();
          this.scenarioStoreHasChanged = false;
          this.$buefy.toast.open({
            message: "Scenario Saved",
            type: "is-success"
          });
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
    logoutHelper() {
      this.logout = true;
      this.$auth.logout();
    },
    onLogout() {
      if (this.scenarioStoreHasChanged) {
        this.$buefy.modal.open({
          parent: this,
          component: LeaveScenario,
          props: { validate: this.$refs.form.validate },
          events: { exit: this.logoutHelper },
          hasModalCard: true,
          customClass: "dialog",
          trapFocus: true
        });
      } else {
        this.logoutHelper();
      }
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
    removeConditionHelper(id) {
      const scrollElement = this.$refs.layout.$refs.scroll;
      scrollElement.scrollTo({
        // FIXME: have scene sizes reference the Buefy variables somehow
        left: scrollElement.scrollLeft - (350 + 20)
      });
      this.removeCondition(id);
    },
    openScenarioProps() {
      this.$buefy.modal.open({
        parent: this,
        component: ScenarioOptions,
        hasModalCard: true,
        trapFocus: true
      });
    },
    ...mapActions({
      addCondition: "scenario/addCondition",
      removeCondition: "scenario/removeCondition",
      saveScenario: "scenario/saveScenario",
      swapScene: "scenario/swapScene",
      swapCondition: "scenario/swapCondition",
      copyScenes: "scenario/copyScenes",
      copyConditions: "scenario/copyConditions",
      bindScenes: "scenario/bindScenes"
    })
  },
  beforeRouteLeave(to, from, next) {
    this.snackbar && this.closeSnackbar();

    if (!this.logout && this.scenarioStoreHasChanged) {
      this.$buefy.modal.open({
        parent: this,
        component: LeaveScenario,
        props: { valid: !this.sceneErrors.length },
        events: { exit: next },
        hasModalCard: true,
        customClass: "dialog",
        trapFocus: true
      });
    } else {
      next();
    }
  }
};
</script>

<style lang="scss" scoped>
.horizontal-sticky {
  left: 0;
}

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
