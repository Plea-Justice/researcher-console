<template>
  <ScenarioLayout ref="layout" :title="scenarioMeta.name" :logout="onLogout">
    <template ref="header">
      <ToolBar ref="toolbar" class="horizontal-sticky">
        <template v-slot:start>
          <div class="level-item buttons">
            <ToolBarButton
              @click="saveScenario()"
              :value="mode"
              :loading="saving"
              type="is-primary"
              icon-left="save"
            >Save</ToolBarButton>

            <b-button
              @click="collapseAll()"
              :icon-left="collapseBtnProps.icon"
            >{{ collapseBtnProps.name }}</b-button>

            <ToolBarButton
              @click="addCondition()"
              :value="mode"
              :disabled="!numScenes"
            >Add Condition</ToolBarButton>

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
          <div class="level-item">
            <div class="buttons">
              <ToolBarButton @click="openScenarioProps()" :value="mode" icon-left="cog">Options</ToolBarButton>

              <ToolBarButton
                @click="previewSimulation()"
                :value="mode"
                type="is-primary"
                icon-left="eye"
              >Preview</ToolBarButton>

              <ToolBarButton
                @click="downloadZip()"
                :value="mode"
                type="is-primary"
                icon-left="file-download"
              >Download</ToolBarButton>
            </div>
          </div>
        </template>
      </ToolBar>

      <!-- Titles -->
      <div ref="titlebar" :style="titleBarStyle" class="padded-responsive-container title-bar">
        <div :style="frameSideBarActive" class="title-wrapper">
          <div v-for="index in numConditions" :key="index" class="condition-title">
            <div
              v-if="isSelectable(Select.CONDITION)"
              @click="addToSelection(index - 1, Select.CONDITION)"
              class="select-title"
            />
            <b-button
              @click="removeCondition(index - 1)"
              type="is-text"
              icon-left="times"
              class="close-button"
            />
            <h1 class="subtitle">{{ "Condition " + index }}</h1>
          </div>
        </div>
      </div>
    </template>

    <section class="padded-responsive-container responsive-center">
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
        :selectable="isSelectable(Select.SCENE)"
      />
    </section>
  </ScenarioLayout>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Bus
import { EventBus, Event } from "~/bus/eventbus";

import ScenarioLayout from "~/components/layouts/ScenarioLayout";
import NavBar from "~/components/NavBar";
import ToolBar from "~/components/ToolBar";
import ToolBarButton from "~/components/ToolBarButton";
import SceneFrame from "~/components/SceneFrame";
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
    ScenarioOptions
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
        actions: {
          [Select.SCENE]: this.copyScene,
          [Select.CONDITION]: this.copyCondition
        }
      },
      [Modes.BIND]: {
        type: Select.SCENE,
        actions: {
          [Select.SCENE]: this.bindScene
        }
      },
      [Modes.SWAP]: {
        type: Select.ANY,
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
      numConditions: "scenario/numConditions",
      numScenes: "scenario/numScenes",
      frameSet: "scenario/frameSet"
    }),
    titleBarStyle() {
      return { "--num-conditions": this.numConditions };
    },
    frameSideBarActive() {
      return { "--frame-sidebar-active": this.numScenes ? 1 : 0 };
    },
    collapseBtnProps() {
      return {
        icon: `${this.collapsed ? "expand" : "compress"}-alt`,
        name: `${this.collapsed ? "Expand" : "Collapse"} All`
      };
    }
  },
  methods: {
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
    isSelectable(selectionType) {
      return (
        this.mode !== this.Modes.DEFAULT &&
        (this.select === this.Select.ANY || this.select === selectionType)
      );
    },
    selectionReset() {
      this.selectionList = [];
      this.select = this.Select.NONE;
    },
    addToSelection(eSceneId, selectedType) {
      this.closeSnackbar();
      this.selectionList.push(eSceneId);

      // If first item
      if (this.selectionList.length === 1) {
        // Update selection
        this.select = selectedType;

        const selectionName = this.selectNames[selectedType];
        const modeName = this.modeNames[this.mode];

        this.snackbar = this.$buefy.snackbar.open({
          message: `Select ${selectionName} to ${modeName} to`,
          type: "is-danger",
          position: "is-top",
          indefinite: true,
          actionText: "Cancel",
          onAction: () => {
            this.selectionReset();
            this.mode = this.Modes.DEFAULT;
          }
        });
      } else {
        // Call appropriate action from modeOptions actions based on current selection
        this.modeOptions[this.mode].actions[this.select](this.selectionList);

        this.selectionReset();
        this.mode = this.Modes.DEFAULT;
      }
    },
    toggleHandler(toggledOn, modeName) {
      if (toggledOn) {
        this.snackbar = this.$buefy.snackbar.open({
          message: `Select element to ${this.modeNames[this.mode]} from`,
          type: "is-danger",
          position: "is-top",
          indefinite: true,
          actionText: "Cancel",
          onAction: () => {
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
        const frameTopPos = this.$refs.form.$el.children[
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
    openScenarioProps() {
      this.$buefy.modal.open({
        parent: this,
        component: ScenarioOptions,
        hasModalCard: true,
        trapFocus: true
      });
    },
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
          onConfirm: () => setTimeout(this.openScenarioProps, 150)
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
            `/api/v1/s/${this.scenarioMeta.id}/generate`
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
          `/api/v1/s/${this.scenarioMeta.id}/zip`
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
    ...mapActions({
      addCondition: "scenario/addCondition",
      removeCondition: "scenario/removeCondition",
      saveScenario: "scenario/saveScenario",
      swapScene: "scenario/swapScene",
      swapCondition: "scenario/swapCondition",
      copyScene: "scenario/copyScene",
      copyCondition: "scenario/copyCondition",
      bindScene: "scenario/bindScene"
    })
  },
  beforeRouteLeave(to, from, next) {
    this.snackbar && this.closeSnackbar();

    if (!this.logout && this.scenarioStoreHasChanged) {
      this.$buefy.modal.open({
        parent: this,
        component: LeaveScenario,
        props: { validate: this.$refs.form.validate },
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
  @include sticky();
  left: 0;
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
  @include selectable();
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
