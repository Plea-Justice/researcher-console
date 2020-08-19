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
              type="is-primary"
            >Save</ToolBarButton>

            <ToolBarButton @click="openScenarioProps()" :value="mode" icon-left="cog">Options</ToolBarButton>

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
            >Add Condition</ToolBarButton>
          </div>

          <div class="level-item buttons">
            <ToolBarButton
              v-model="mode"
              @click="toggleHandler($event, 'swap')"
              :mode="Modes.SWAP"
              :disabled="numScenes < 2"
            >Swap</ToolBarButton>

            <ToolBarButton
              v-model="mode"
              @click="toggleHandler($event, 'copy')"
              :mode="Modes.COPY"
              :disabled="numScenes < 2"
            >Copy</ToolBarButton>

            <ToolBarButton
              v-model="mode"
              @click="toggleHandler($event, 'bind')"
              :mode="Modes.BIND"
              :disabled="numScenes < 2"
            >Bind</ToolBarButton>
          </div>
        </template>

        <template v-slot:end>
          <div v-if="scenarioStoreHasChanged" class="level-item">
            <b-tag type="is-warning">Unsaved changes</b-tag>
          </div>

          <div class="level-item">
            <PreviewDropdown :scenarioMeta="scenarioMeta" @openScenarioProps="openScenarioProps" />
          </div>
        </template>
      </ToolBar>

      <!-- Titles -->
      <div ref="titlebar" :style="titleBarStyle" class="padded-responsive-container title-bar">
        <div :style="frameSideBarActive" class="title-wrapper">
          <div v-for="index in numConditions" :key="index" class="condition-title">
            <div
              v-if="isSelectable(Select.CONDITION, index)"
              @click="addToSelection(index - 1, Select.CONDITION)"
              class="select-title"
            />
            <b-button
              @click="removeConditionHelper(index - 1)"
              type="is-text"
              icon-left="times"
              class="close-button"
            />
            <h1 class="subtitle">{{ "Condition " + index }}</h1>
          </div>
        </div>
      </div>
    </template>

    <p>{{ conditionSet }}</p>

    <section ref="frames" class="padded-responsive-container responsive-center">
      <!-- Frames -->
      <SceneFrame
        v-for="(frame, index) in frameSet"
        :key="`${frame.id}`"
        @scroll-to="scrollToFrame($event)"
        @selected="addToSelection($event, Select.SCENE)"
        :frame="frame"
        :frameIndex="index"
        :isFirst="index === 0"
        :isLast="index === frameSet.length - 1"
        :selectable="isSelectable(Select.SCENE, index)"
      />
    </section>
  </ScenarioLayout>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Bus
import { EventBus, Event } from "~/bus/eventbus";

// Import Components
import ScenarioLayout from "~/components/layouts/ScenarioLayout";
import NavBar from "~/components/NavBar";
import ToolBar from "~/components/ToolBar";
import ToolBarButton from "~/components/ToolBarButton";
import SceneFrame from "~/components/SceneFrame";
import PreviewDropdown from "~/components/PreviewDropdown";
import ScenarioOptions from "~/components/modals/ScenarioOptions";
import LeaveScenario from "~/components/modals/LeaveScenario";

// Content for help fields
import { scenarioHelp } from "~/assets/helpText";

export default {
  name: "Scenario",
  components: {
    ScenarioLayout,
    NavBar,
    ToolBar,
    ToolBarButton,
    SceneFrame,
    ScenarioOptions,
    PreviewDropdown
  },
  data() {
    const Modes = {
      DEFAULT: 0,
      COPY: 1,
      BIND: 2,
      SWAP: 3
    };
    const modeNames = [];
    Object.entries(Modes).forEach(
      ([key, val]) => (modeNames[val] = key.toLowerCase())
    );

    const Select = {
      NONE: 0,
      ANY: 1,
      SCENE: 2,
      CONDITION: 3
    };
    const selectNames = [];
    Object.entries(Select).forEach(
      ([key, val]) => (selectNames[val] = key.toLowerCase())
    );

    const modeOptions = {
      [Modes.COPY]: {
        type: Select.ANY,
        filters: [],
        actions: {
          [Select.SCENE]: this.copyScenes,
          [Select.CONDITION]: this.copyConditions
        }
      },
      [Modes.BIND]: {
        type: Select.SCENE,
        filters: ["frame"],
        actions: {
          [Select.SCENE]: this.bindScenes
        }
      },
      [Modes.SWAP]: {
        type: Select.ANY,
        max: 2,
        filters: ["condition"],
        actions: {
          [Select.SCENE]: this.swapScene,
          [Select.CONDITION]: this.swapCondition
        }
      }
    };
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
      snackbar: null,

      Modes,
      modeNames,
      // Set to initial
      mode: Modes.DEFAULT,

      Select,
      selectNames,
      // Set to initial
      select: Select.ANY,
      selectParent: null,
      modeOptions,

      selectionCounter: 0,
      selectionList: []
    };
  },
  async fetch({ store, params }) {
    await Promise.all([
      store.dispatch("scenario/getScenario", params.id),
      store.dispatch("assets/getAssets")
    ]);
  },
  created() {
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
      this.$refs.toolbar.$el.clientHeight + this.$refs.titlebar.clientHeight;
  },
  computed: {
    ...mapGetters({
      scenarioMeta: "scenario/scenarioMeta",
      sceneErrors: "scenario/errors",
      numConditions: "scenario/numConditions",
      numScenes: "scenario/numScenes",
      conditionSet: "scenario/conditionSet",
      frameSet: "scenario/frameSet"
    }),
    titleBarStyle() {
      return { "--num-conditions": this.numConditions };
    },
    frameSideBarActive() {
      return { "--frame-sidebar-active": this.numScenes ? 1 : 0 };
    }
  },
  methods: {
    findScene(sceneId) {
      let indexPair = null;
      for (const [frameIndex, { scenes }] of this.frameSet.entries()) {
        const sceneIndex = scenes.indexOf(sceneId);
        if (sceneIndex !== -1) {
          indexPair = [frameIndex, sceneIndex];
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
              } at scene ${errorIndex[1] + 1} of current row`,
              type: "is-danger"
            });
            this.scrollToFrame({ frameIndex: errorIndex[0] });
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
          type: "is-success"
        });
      }
    },
    collapseAll() {
      this.collapsed = !this.collapsed;
      Event.collapseAll();
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
    async onSubmit() {
      const valid = await this.$refs.form.validate();
      if (valid) {
        this.saving = true;
        const status = this.saveScenario();
        if (status) {
          this.saving = false;
          this.$buefy.toast.open({
            message: "Scenario Saved",
            type: "is-success"
          });
        } else {
          this.$buefy.toast.open({
            message: "An invalid scene exists",
            type: "is-danger"
          });
        }
      }
    },
    toggleHandler(toggledOn, modeName) {
      if (toggledOn) {
        this.snackbar = this.$buefy.snackbar.open({
          message: `Select element to ${this.modeNames[this.mode]} from`,
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
    isSelectable(selectionType, index) {
      const test =
        this.mode !== this.Modes.DEFAULT &&
        (this.select === this.Select.ANY || this.select === selectionType);

      let result = false;
      if (test) {
        if (!this.selectParent) result = true;
        else {
          // If there is a filter
          const filters = this.modeOptions[this.mode].filters;
          const frameFilter = {
            parent: this.selectParent,
            selectionList: this.selectionList,
            filters
          };

          // If there is a frame filter it & pass filter down
          result =
            selectionType === this.Select.SCENE &&
            this.modeOptions[this.mode].filters.includes("frame")
              ? this.selectParent[0] === index && frameFilter
              : frameFilter;
        }
      }

      return result;
    },
    selectionReset() {
      this.selectParent = null;
      this.selectionList = [];
      this.select = this.Select.NONE;
    },
    addToSelection(eSceneId, selectedType) {
      this.selectionList.push(eSceneId);
      const options = this.modeOptions[this.mode];
      const selectionLen = this.selectionList.length;

      // If first item
      if (selectionLen === 1) {
        // Update selection
        this.select = selectedType;
        this.selectParent = this.findScene(this.selectionList[0]);

        this.snackbar.message = `Select ${this.selectNames[selectedType]} to ${
          this.modeNames[this.mode]
        } to`;
      } else if (
        (options.max && selectionLen >= options.max) ||
        (options.filters &&
          options.filters.includes("frame") &&
          selectionLen >= this.frameSet[this.selectParent[0]].scenes.length)
      ) {
        // If exceeds max selection property or has frame filter and selected all scenes in frame
        // then auto-end the selection process
        this.modeOptions[this.mode].actions[this.select](this.selectionList);
        this.closeSnackbar();
        this.mode = this.Modes.DEFAULT;
        this.selectionReset();
      } else if (this.selectionList.length === 2) {
        this.snackbar.actionText = "Done";
        this.snackbar.type = "is-info";
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
    removeConditionHelper(index) {
      const scrollElement = this.$refs.layout.$refs.scroll;
      scrollElement.scrollTo({
        // FIXME: have scene sizes reference the Buefy variables somehow
        left: scrollElement.scrollLeft - (350 + 20)
      });
      this.removeCondition(index);
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

.level-item.buttons {
  margin-bottom: 0;
  margin-right: 2rem;

  & > .button {
    margin-bottom: 0;
  }
}

.title-bar {
  // Sticky below toolbar
  @include sticky();
  top: 4rem;

  // Width & sizing
  height: 3rem;
  width: max-content;
  margin: 2rem auto 0.25rem;

  background-color: #fffe;
}

.title-wrapper {
  height: 100%;
  display: flex;
  align-items: center;

  $scene: $frameSceneGap + $sceneWidth;
  width: calc(
    #{$scene} * var(--num-conditions) - #{$frameSceneGap} +
      var(--frame-sidebar-active) * #{$frameSideBarWidth} + #{$framePadding} * 2
  );
  padding-left: calc(
    #{$framePadding} + var(--frame-sidebar-active) * #{$frameSideBarWidth}
  );

  // This is effectively flex-gap .condition-title
  // For every .condition-title except the last one
  & > :nth-last-child(n + 2) {
    margin-right: $frameSceneGap;
  }
}

.condition-title {
  @include flexCenter();
  flex: 0 0 $sceneWidth;
  // For .select-title placement
  position: relative;
}

.select-title {
  @include selectionMask();
  border-radius: $radius-large;
}

.close-button {
  color: $danger;
  /* Shift left so title is centerd */
  width: 1rem;
  margin-left: -1rem;

  &:hover,
  &:active {
    color: $danger;
  }
}

.responsive-center {
  max-width: max-content;
  margin-left: auto;
  margin-right: auto;
}
</style>
