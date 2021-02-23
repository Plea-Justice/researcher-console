<template>
  <ScenarioLayout ref="layout" :title="scenarioMeta.name" :logout="onLogout">
    <template ref="header">
      <b-loading is-full-page can-cancel :active="loading"></b-loading>
      <ToolBar ref="toolbar" class="toolbar-horizontal-sticky">
        <template v-slot:start>
          <div class="level-item buttons">
            <b-tooltip
              :active="!!saveState.tooltip"
              :label="saveState.tooltip"
              :type="`${saveState.type}`"
              position="is-bottom"
              always
            >
              <ToolBarButton
                @click="saveHelper()"
                :value="mode"
                :loading="saving"
                :label="saveState.text"
                :type="saveState.type"
                :icon-left="saveState.icon"
                style="min-width: 69px"
              />
            </b-tooltip>

            <b-tooltip
              :active="!scenarioMeta.survey || scenarioAssetList.length < 1"
              :label="optionWarnings.message || ''"
              type="is-warning is-light"
              position="is-bottom"
            >
              <ToolBarButton
                @click="openScenarioOptions(optionWarnings.tab)"
                :value="mode"
                label="Options"
                icon-left="cog"
                :icon-right="optionWarnings.flag ? 'info-circle' : ''"
                :type="optionWarnings.flag ? 'is-warning' : ''"
              />
            </b-tooltip>

            <b-button
              @click="collapseAll()"
              :icon-left="`${collapsed ? 'expand' : 'compress'}-arrows-alt`"
              :disabled="numScenes < 1 || frameSet.length <= 1"
            />
          </div>

          <div class="level-item buttons">
            <ToolBarButton
              @click="addCondition()"
              :value="mode"
              :disabled="!numScenes"
              label="Add Condition"
            />
          </div>

          <div class="level-item buttons">
            <ToolBarButton
              v-model="mode"
              @click="toggleHandler($event, 'swap')"
              :mode="Modes.SWAP"
              :disabled="numScenes < 2"
              label="Swap"
            />

            <ToolBarButton
              v-model="mode"
              @click="toggleHandler($event, 'copy')"
              :mode="Modes.COPY"
              :disabled="numScenes < 2"
              label="Copy"
            />

            <ToolBarButton
              v-model="mode"
              @click="toggleHandler($event, 'bind')"
              :mode="Modes.BIND"
              :disabled="numScenes < 2"
              label="Bind"
            />
          </div>
        </template>

        <template v-slot:end>
          <div class="level-item">
            <PreviewDropdown
              @goToErrors="goToErrors()"
              @openScenarioOptions="openScenarioOptions"
              @published="$fetch()"
            />
          </div>
        </template>
      </ToolBar>

      <div class="messagebar" v-if="messages">
        {{ messages }}
      </div>

      <ConditionBar
        ref="conditionbar"
        @remove="removeConditionHelper($event)"
        @selected="addToSelection($event, Select.CONDITION)"
        :selectable="isSelectable(Select.CONDITION)"
        :extraVSpace="scenarioStoreHasChanged"
      />
    </template>

    <!-- Debug Info -->
    <section class="section" v-if="env.MODE === 'development'">
      <p>Scenes: {{ numScenes }}</p>
      <p>State Changed: {{ scenarioStoreHasChanged }}</p>
      <p>{{ scenarioStatus }}</p>
      <p>{{ scenarioMeta }}</p>
    </section>

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

// Import Mixins
import Selection from "~/mixins/Selection";

// Import Components
import ScenarioLayout from "~/components/layouts/ScenarioLayout";
import ToolBar from "~/components/ToolBar";
import ToolBarButton from "~/components/ToolBarButton";
import ConditionBar from "~/components/scenario/ConditionBar";
import SceneFrame from "~/components/scenario/SceneFrame";
import PreviewDropdown from "~/components/scenario/PreviewDropdown";
import ScenarioOptions from "~/components/modals/ScenarioOptions/ScenarioOptions";
import LeaveScenario from "~/components/modals/LeaveScenario";

// Content for help fields
import { scenarioHelp } from "~/assets/helpText";

export default {
  name: "Scenario",
  mixins: [Selection],
  components: {
    ScenarioLayout,
    ToolBar,
    ToolBarButton,
    ConditionBar,
    SceneFrame,
    ScenarioOptions,
    PreviewDropdown,
  },
  data() {
    return {
      // Env
      env: { MODE: process.env.MODE },

      // import from JS file
      scenarioHelp: scenarioHelp,

      // **** Created() ****
      // Track VueX Subscription
      scenarioStoreHasChanged: false,
      headerHeight: 0,

      loading: false,
      saving: false,
      saveStatus: {
        valid: {
          type: "is-success",
          icon: "check",
        },
        invalid: {
          type: "is-danger",
          icon: "times",
        },
        changed: {
          type: "is-warning",
          text: "Save",
        },
      },

      collapsed: false,
      logout: false,
      snackbar: null,
    };
  },
  async fetch() {
    this.loading = true;
    await Promise.all([
      this.getScenario(this.$route.params.id),
      this.getAssets()
    ]);
    this.scenarioStoreHasChanged = false;
    this.loading = false;
  },
  created() {
    const excludedMutators = [
      "scenario/resetState",
      "scenario/setScenario",
      "scenario/setSceneErrors",
      "scenario/setFrameErrors",
      "scenario/updateScenarioValidity",
      "scenario/saveMeta",
    ];

    this.$store.subscribe((mutation, state) => {
      if (
        this.scenarioStoreHasChanged &&
        mutation.type === "scenario/putScenario"
      ) {
        this.scenarioStoreHasChanged = false;
      } else if (
        !this.scenarioStoreHasChanged &&
        !this.loading &&
        mutation.type.startsWith("scenario/") &&
        !excludedMutators.includes(mutation.type)
      ) {
        // Else for any mutation in 'scenario' store (except exclusions)
        this.scenarioStoreHasChanged = true;
      }
    });
  },
  mounted() {
    // Define header height
    this.headerHeight =
      this.$refs.toolbar.$el.clientHeight +
      this.$refs.conditionbar.$el.clientHeight;

    // CTRL + S to save. Use a library if we add more hotkeys.
    this._listenKeySave = (e) => {
      if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        //FIXME: this should click the save button instead
        e.preventDefault();
        this.saveHelper();
      }
    };

    document.addEventListener("keydown", this._listenKeySave);
  },
  computed: {
    ...mapGetters({
      scenarioMeta: "scenario/scenarioMeta",
      scenarioStatus: "scenario/status",
      scenarioAssetList: "scenario/assetList",
      numScenes: "scenario/numScenes",
      frameSet: "scenario/frameSet",
    }),
    messages() {
      if (this.scenarioStoreHasChanged)
        return "Unsaved changes. Click \"Save\" to keep your changes."
      if (Date.parse(this.scenarioMeta.published) < Date.parse(this.scenarioMeta.modified))
        return "Saved changes are not visible to participants until the scenario has been published."
      return false;
    },
    optionWarnings() {
      if (!this.scenarioMeta.survey || !this.scenarioAssetList.length)
        return {
          flag: true,
          message: !this.scenarioAssetList.length
            ? "You have not selected any assets to use with this scenario."
            : "Some scenario options have not been set.",
          tab: !this.scenarioAssetList.length ? "assets" : "settings",
        };
      else
        return {
          flag: false,
        };
    },
    numErrors() {
      const { frameErrors, sceneErrors } = this.scenarioStatus;
      return frameErrors.length + sceneErrors.length;
    },
    errorIndex() {
      const { frameErrors, sceneErrors } = this.scenarioStatus;

      if (this.numErrors) {
        return frameErrors.length
          ? this.frameSet.findIndex((frame) => frame.id === frameErrors[0])
          : this.findScene(sceneErrors[0]);
      } else return null;
    },
    errorHelperLabel() {
      const { frameErrors, sceneErrors } = this.scenarioStatus;

      if (this.numErrors) {
        return `${
          this.numErrors > 1
            ? `${this.numErrors} errors exists, starting`
            : "An error exists"
        }
                with
                ${
                  frameErrors.length
                    ? `row ${this.errorIndex + 1}'s label`
                    : `scene ${this.errorIndex.scene + 1} of row ${
                        this.errorIndex.frame + 1
                      }`
                }`;
      } else return null;
    },
    saveState() {
      if (!this.scenarioStatus.valid)
        return { ...this.saveStatus.invalid, tooltip: this.errorHelperLabel };
      else if (this.scenarioStoreHasChanged) return this.saveStatus.changed;
      else if (this.scenarioStatus.valid && !this.scenarioStoreHasChanged)
        return this.saveStatus.valid;
      else return { type: "is-primary" };
    },
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
      if (this.numErrors) {
        const frameIndex = this.errorIndex?.frame ?? this.errorIndex;

        this.$buefy.toast.open({
          message: this.errorHelperLabel,
          type: "is-danger",
        });
        this.scrollToFrame({ frameIndex });
      }
    },
    async saveHelper() {
      // TODO: send out request to validate all groups (frames & scene cards)

      if (this.scenarioStoreHasChanged) {
        this.loading = true;
        this.saving = true;
        if (this.scenarioStatus.valid) {
          await this.saveScenario();
          this.scenarioStoreHasChanged = false;
          this.$buefy.toast.open({
            message: "Scenario Saved",
            type: "is-success",
          });
        } else {
          this.goToErrors();
        }
        this.loading = false;
        this.saving = false;
      } else {
        this.$buefy.toast.open({
          message: "Scenario is already up to date",
          type: "is-info",
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
          },
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
          ...(smooth && { behavior: "smooth" }),
        });
      });
    },
    openScenarioOptions(tab = "") {
      this.$buefy.modal.open({
        parent: this,
        component: ScenarioOptions,
        props: { openTab: tab },
        hasModalCard: true,
        trapFocus: true,
      });
    },
    logoutHelper() {
      this.logout = true;
      this.$auth.logout();
    },
    ...mapActions({
      getScenario: "scenario/getScenario",
      getAssets: "assets/getAssets",
      addCondition: "scenario/addCondition",
      removeCondition: "scenario/removeCondition",
      saveScenario: "scenario/saveScenario",
    }),
    removeConditionHelper(id) {
      const scrollElement = this.$refs.layout.$refs.scroll;
      scrollElement.scrollTo({
        // FIXME: have scene sizes reference the Buefy variables somehow
        left: scrollElement.scrollLeft - (350 + 20),
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
        trapFocus: true,
      });
    },
    onLogout() {
      if (this.scenarioStoreHasChanged) {
        this.LeaveScenarioHelper(this.logoutHelper);
      } else {
        this.logoutHelper();
      }
    },
  },
  beforeRouteLeave(to, from, next) {
    this.snackbar && this.closeSnackbar();

    document.removeEventListener("keydown", this._listenKeySave);

    if (!this.logout && this.scenarioStoreHasChanged) {
      this.LeaveScenarioHelper(next);
    } else {
      next();
    }
  },
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

  & > .b-tooltip .button {
    margin-bottom: 0;
  }
}

.toolbar-horizontal-sticky {
  left: 0;
}

.responsive-center {
  max-width: max-content;
  margin-left: auto;
  margin-right: auto;
}

.messagebar {
  @include sticky();
  top: 4rem;
  font-size: $size-7;

  min-width: 100%;
  width: max-content;
  background-color: $warning;

  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 4rem;

  margin-left: auto;
  margin-right: auto;
}

</style>
