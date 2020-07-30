<template>
  <div ref="scroll" class="scroll-wrapper">
    <NavBar
      :title="scenarioMeta.name"
      :logout="this.onLogout"
      helpTitle="Scenario Story Editor"
      :helpText="scenarioHelp.navbar"
      path="/scenarios"
      class="horizontal-sticky"
    />

    <ToolBar ref="toolbar" class="horizontal-sticky">
      <template v-slot:start>
        <div class="level-item buttons">
          <ToolBarButton
            @click="submitHandler()"
            :value="mode"
            type="is-primary"
            icon-left="save"
            >Save</ToolBarButton
          >

          <b-button @click="collapseAll()" :icon-left="collapseBtnProps.icon">{{
            collapseBtnProps.name
          }}</b-button>

          <ToolBarButton
            @click="addCondition()"
            :value="mode"
            :disabled="!numScenes"
            >Add Condition</ToolBarButton
          >

          <ToolBarButton
            v-model="mode"
            @click="
              toggleHandler($event, selectionReset, startSelectionToast, 'copy')
            "
            :mode="Modes.COPY"
            :disabled="toolBarBtnDisable"
            >Copy</ToolBarButton
          >

          <ToolBarButton
            v-model="mode"
            @click="
              toggleHandler($event, selectionReset, startSelectionToast, 'swap')
            "
            :mode="Modes.SWAP"
            :disabled="toolBarBtnDisable"
            >Swap</ToolBarButton
          >
        </div>
      </template>
      <template v-slot:end>
        <div class="level-item">
          <div class="buttons">
            <ToolBarButton
              @click="openScenarioProps()"
              :value="mode"
              icon-left="edit"
              >Properties</ToolBarButton
            >

            <b-button @click="previewSim()" type="is-primary" icon-left="eye"
              >Preview</b-button
            >
            <b-button
              @click="downloadZip()"
              type="is-primary"
              icon-left="file-download"
              >Download</b-button
            >
          </div>
        </div>
      </template>
    </ToolBar>

    <!-- Titles -->
    <div
      ref="titlebar"
      :style="titleBarStyle"
      class="padded-responsive-container title-bar"
    >
      <div :style="frameSideBarActive" class="title-wrapper">
        <div
          v-for="index in numConditions"
          :key="index"
          class="condition-title"
        >
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

    <section class="padded-responsive-container responsive-center">
      <ValidationObserver ref="form" tag="form" @submit.prevent="onSubmit()">
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

        <b-button ref="submit" native-type="submit" class="is-hidden" />
      </ValidationObserver>
    </section>
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import { ValidationObserver } from "vee-validate";

import NavBar from "~/components/NavBar";
import ToolBar from "~/components/ToolBar";
import ToolBarButton from "~/components/ToolBarButton";
import SceneFrame from "~/components/SceneFrame";
import ScenarioProperties from "~/components/modals/ScenarioProperties";
import LeaveScenario from "~/components/modals/LeaveScenario";

// Import Utils
import { noop } from "~/assets/util";

// Content for help fields
import { scenarioHelp } from "~/assets/helpText";

export default {
  name: "Scenario",
  components: {
    NavBar,
    ToolBar,
    ToolBarButton,
    SceneFrame,
    ScenarioProperties
  },
  data() {
    return {
      // import from JS file
      scenarioHelp: scenarioHelp,

      // **** Created() ****
      // Track VueX Subscription
      scenarioStoreHasChanged: false,
      headerHeight: 0,

      collapsed: false,
      logout: false,
      snackbar: null,
      Modes: {
        DEFAULT: 0,
        COPY: 1,
        BIND: 2,
        SWAP: 3
      },
      // Set to DEFAULT mode
      mode: 0,
      // Selection state
      Select: {
        ALL: 0,
        SCENE: 1,
        CONDITION: 2
      },
      // Set to DEFAULT mode
      select: 0,

      selectionCounter: 0,
      selectionList: []
    };
  },
  async fetch({ store, params }) {
    await store.dispatch("scenario/getScenario", params.id);
    await store.dispatch("assets/getAssets");
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

    this.$nextTick(() => {
      // Define header height
      this.headerHeight =
        this.$refs["toolbar"].$el.clientHeight +
        this.$refs["titlebar"].clientHeight;
    });
  },
  computed: {
    ...mapGetters({
      scenarioMeta: "scenario/scenarioMeta",
      numConditions: "scenario/numConditions",
      numScenes: "scenario/numScenes",
      frameSet: "scenario/frameSet"
    }),
    toolBarBtnDisable() {
      return this.numScenes < 2;
    },
    titleBarStyle() {
      return { "--num-conditions": this.numConditions };
    },
    frameSideBarActive() {
      console.log(`Sidebar: ${this.numScenes ? 1 : 0}`);
      return { "--frame-sidebar-active": this.numScenes ? 1 : 0 };
    },
    collapseBtnProps() {
      const test = this.scenarioMeta.collapsed;
      return {
        icon: `${test ? "expand" : "compress"}-alt`,
        name: `${test ? "Expand" : "Collapse"} All`
      };
    }
  },
  methods: {
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
      }
    },
    submitHandler() {
      this.$refs.submit.$el.click();
    },
    onSubmit() {
      this.$refs.form.validate().then(success => {
        if (success) {
          this.saveScenario();
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
      });
    },
    isSelectable(selectionType) {
      return (
        this.mode !== this.Modes.DEFAULT &&
        (this.select === this.Select.ALL || this.select === selectionType)
      );
    },
    startSelectionToast(modeName) {
      this.snackbar = this.$buefy.snackbar.open({
        message: `Select element to ${modeName} from`,
        type: "is-danger",
        position: "is-top",
        indefinite: true,
        actionText: "Cancel",
        onAction: () => {
          this.selectionReset;
          this.mode = this.Modes.DEFAULT;
        }
      });
    },
    selectionReset() {
      this.selectionList = [];
      this.select = this.Select.ALL;
    },
    addToSelection(eSceneId, selectedType) {
      this.snackbar.close();
      this.selectionList.push(eSceneId);

      // If first item
      if (this.selectionList.length === 1) {
        this.select = selectedType;

        // FIXME: make these static maps
        const typeName = Object.keys(this.Select)
          .find(key => this.Select[key] === selectedType)
          .toLowerCase();
        const modeName = Object.keys(this.Modes)
          .find(key => this.Modes[key] === this.mode)
          .toLowerCase();

        this.snackbar = this.$buefy.snackbar.open({
          message: `Select ${typeName} to ${modeName} to`,
          type: "is-danger",
          position: "is-top",
          indefinite: true,
          actionText: "Cancel",
          onAction: () => {
            this.selectionReset;
            this.mode = this.Modes.DEFAULT;
          }
        });
      } else if (this.selectionList.length >= 2) {
        //FIXME: make this dynamic or a case statement?
        if (this.select === this.Select.SCENE) {
          this.mode === this.Modes.COPY && this.copyScene(this.selectionList);
          this.mode === this.Modes.SWAP && this.swapScene(this.selectionList);
        } else if (this.select === this.Select.CONDITION) {
          this.mode === this.Modes.COPY &&
            this.copyCondition(this.selectionList);
          this.mode === this.Modes.SWAP &&
            this.swapCondition(this.selectionList);
        }
        // Reset
        this.selectionReset();
        this.mode = this.Modes.DEFAULT;
      }
    },
    toggleHandler(
      eventState,
      onUntoggle = noop,
      onToggle = noop,
      modeName = ""
    ) {
      if (eventState) {
        onToggle(modeName);
      } else {
        this.snackbar && this.snackbar.close();
        onUntoggle();
      }
    },
    scrollToFrame({ frameIndex, smooth = true }) {
      this.$nextTick(() => {
        const frameTopPos = this.$refs.form.$el.children[
          frameIndex
        ].getBoundingClientRect().top;

        // Scroll so that the element is at the top of the view
        const scrollElement = this.$refs.scroll;
        scrollElement.scrollTo({
          top: frameTopPos - this.headerHeight + scrollElement.scrollTop,
          ...(smooth && { behavior: "smooth" })
        });
      });
    },
    openScenarioProps() {
      this.$buefy.modal.open({
        parent: this,
        component: ScenarioProperties,
        hasModalCard: true,
        trapFocus: true
      });
    },
    async genSim() {
      // TODO: Ask on unsaved, invalid, etc.
      if (!this.scenarioMeta.survey)
        this.$buefy.dialog.alert({
          title: "Survey Redirect Unset",
          message:
            "No survey URL has been set. Set the survey URL in 'Properties'.",
          type: "is-danger",
          hasIcon: true
        });
      else {
        this.$buefy.toast.open({
          message: "Please wait. Generating simulation...",
          type: "is-success",
          duration: 4000
        });

        let response = await this.$axios.post(
          `/api/v1/s/${this.scenarioMeta.id}/zip`
        );
        if (response.status != 200) return false;
        return true;
      }

      return false;
    },
    async downloadZip() {
      if (await this.genSim())
        window.open(
          `${this.$axios.defaults.baseURL}/sim-serve/sim-${this.scenarioMeta.id}.zip`
        );
    },
    async previewSim() {
      if (await this.genSim())
        window.open(
          `${this.$axios.defaults.baseURL}/sim-serve/sim-${this.scenarioMeta.id}/`
        );
    },
    ...mapActions({
      addCondition: "scenario/addCondition",
      removeCondition: "scenario/removeCondition",
      saveScenario: "scenario/saveScenario",
      updateFrames: "scenario/updateFrames",
      updateMetaKey: "scenario/updateMetaKey",
      copyScene: "scenario/copyScene",
      copyCondition: "scenario/copyCondition",
      swapScene: "scenario/swapScene",
      swapCondition: "scenario/swapCondition"
    }),
    //FIXME: make collapsing VueX independent
    collapseAll() {
      const entry = {
        key: "collapsed",
        val: !this.scenarioMeta.collapsed
      };

      this.updateMetaKey(entry);
      this.updateFrames(entry);
    }
  },
  beforeRouteLeave(to, from, next) {
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
  },
  head() {
    return {
      title: `${this.$siteConfig.title} | ${this.scenarioMeta.name}`,
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Scenario Chart"
        }
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
.scroll-wrapper {
  height: 100vh;
  width: 100%;
  overflow-x: scroll;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  overflow-anchor: none;
}

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
