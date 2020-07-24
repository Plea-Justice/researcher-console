<template>
  <div>
    <NavBar
      :title="scenarioMeta.name"
      :logout="logout"
      helpTitle="Scenario Story Editor"
      :helpText="scenarioHelp.navbar"
      path="/scenarios"
    />

    <ToolBar ref="toolbar">
      <template v-slot:start>
        <div class="level-item buttons">
          <ToolBarButton
            @click="submitHandler()"
            :value="mode"
            type="is-primary"
            icon-left="content-save"
          >Save</ToolBarButton>

          <ToolBarButton
            @click="openScenarioProps()"
            :value="mode"
            icon-left="movie-edit-outline"
          >Properties</ToolBarButton>

          <b-button
            @click="collapseAll()"
            :icon-left="collapsedBtnProps.icon"
          >{{ collapsedBtnProps.name }}</b-button>

          <ToolBarButton @click="addCondition()" :value="mode">Add Condition</ToolBarButton>

          <ToolBarButton
            v-model="mode"
            @click="
              toggleHandler($event, selectionReset, startSelectionToast, 'copy')
            "
            :mode="Modes.COPY"
          >Copy</ToolBarButton>
        </div>
      </template>
      <template v-slot:end>
        <div class="level-item">
          <div class="buttons">
            <b-button
              @click="downloadZip()"
              type="is-primary"
              icon-left="folder-download"
            >Download Package</b-button>
          </div>
        </div>
      </template>
    </ToolBar>

    <!-- Titles -->
    <div ref="titles" class="sticky padded-responsive-container condition-bar condition-titles">
      <div class="title-wrapper">
        <div v-for="index in numConditions" :key="index" class="condition-title">
          <div
            v-if="isSelectable(Select.CONDITION)"
            @click="addToSelection(index, Select.CONDITION)"
            class="select-title"
          />
          <b-button
            @click="removeCondition(index - 1)"
            type="is-text"
            icon-left="close"
            class="close-button"
          />
          <h1 class="subtitle">{{ "Condition " + index }}</h1>
        </div>
      </div>
    </div>

    <!-- Scrolling Wrapper -->
    <div @scroll="handleScroll($event)" ref="horizontalScroll" class="scrollable">
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
import { noop, throttle } from "~/assets/util";

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
      Modes: {
        DEFAULT: 0,
        COPY: 1,
        BIND: 2
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
        this.$refs["titles"].clientHeight;
    });
  },
  computed: {
    collapsedBtnProps() {
      const test = this.scenarioMeta.collapsed;
      return {
        icon: `${test ? "expand" : "collapse"}-all-outline`,
        name: `${test ? "Expand" : "Collapse"} All`
      };
    },
    ...mapGetters({
      scenarioMeta: "scenario/scenarioMeta",
      numConditions: "scenario/numConditions",
      frameSet: "scenario/frameSet"
    })
  },
  methods: {
    logout() {
      if (this.scenarioStoreHasChanged) {
        this.$buefy.modal.open({
          parent: this,
          component: LeaveScenario,
          props: {
            afterSave: this.$auth.logout,
            validate: this.$refs.form.validate
          },
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
        this.mode === this.Modes.COPY &&
        (this.select === this.Select.ALL || this.select === selectionType)
      );
    },
    startSelectionToast(modeName) {
      this.$buefy.toast.open({
        message: `Select element to ${modeName} from`,
        type: "is-info"
      });
    },
    selectionReset() {
      this.selectionList = [];
      this.select = this.Select.ALL;
    },
    addToSelection(eSceneId, selectedType) {
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
        this.$buefy.toast.open({
          message: `Select ${typeName} to ${modeName} to`,
          type: "is-info"
        });
      } else if (this.selectionList.length >= 2) {
        if (this.select === this.Select.SCENE) {
          this.copyScene(this.selectionList);
        } else if (this.select === this.Select.CONDITION) {
          this.copyCondition(this.selectionList);
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
      eventState ? onToggle(modeName) : onUntoggle();
    },
    handleScroll: throttle(function(event) {
      const leftScroll = event.target.scrollLeft;

      // Target elements you want to move now
      this.$refs.titles.scrollLeft = leftScroll;
      //TODO: only update add button on current frame(s)
    }, 20),
    scrollToFrame({ frameIndex, smooth = true }) {
      this.$nextTick(() => {
        const frameTopPos = this.$refs.form.$el.children[
          frameIndex
        ].getBoundingClientRect().top;

        // Scroll so that the element is at the top of the view
        window.scrollTo({
          top: frameTopPos - this.headerHeight + window.pageYOffset,
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
    downloadZip() {
      let start = () => {
        this.$buefy.toast.open({
          message: "Simulation download will begin shortly.",
          type: "is-success"
        });
        window.location = `${this.$axios.defaults.baseURL}/api/v1/s/${this.scenarioMeta.id}/zip`;
      };

      // TODO: Ask on unsaved, invalid, etc.
      if (!this.scenarioMeta.survey)
        this.$buefy.dialog.confirm({
          title: "Survey Redirect Unset",
          message:
            "No survey URL has been set. Set the survey URL in 'Properties'.",
          confirmText: "Download Anyway",
          type: "is-danger",
          hasIcon: true,
          onConfirm: start
        });
      else start();
    },
    ...mapActions({
      addCondition: "scenario/addCondition",
      removeCondition: "scenario/removeCondition",
      saveScenario: "scenario/saveScenario",
      updateFrames: "scenario/updateFrames",
      updateMetaKey: "scenario/updateMetaKey",
      copyScene: "scenario/copyScene",
      copyCondition: "scenario/copyCondition"
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
    if (this.scenarioStoreHasChanged) {
      this.$buefy.modal.open({
        parent: this,
        component: LeaveScenario,
        props: { afterSave: next, validate: this.$refs.form.validate },
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
.condition-bar {
  // Scrollable
  overflow-x: hidden;
  // Sticky below toolbar
  top: 4rem;
  margin-bottom: 0.25rem;
  background-color: #fffe;

  // General Props
  height: 3rem;
  margin-top: 2rem;
}

.title-wrapper {
  height: 100%;
  display: flex;
  align-items: center;

  // calc(responsive-containter + frame-box-padding + sidebar-flex-basis + sidebar-margin-right)
  /* padding-left: calc(
    #{$responsiveContainerSpacing} + #{$framePadding} + #{$frameSideBarWidth}
  ); */
  padding-left: calc(#{$framePadding} + #{$frameSideBarWidth});
  // margin-right: $framePadding;

  // Effectively flex-gap .condition-title
  // For every .condition-title except the last one
  & > :nth-last-child(n + 2) {
    //TODO: pair this to scene-flex-gap
    margin-right: $frameSceneGap;
  }
}

.condition-title {
  @include flexCenter();
  //position: relative;
  flex: 0 0 $sceneWidth;
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

.scrollable {
  overflow-y: hidden;
  overflow-anchor: none;
}

.responsive-center {
  max-width: max-content;
  margin-left: auto;
  margin-right: auto;
}
</style>
