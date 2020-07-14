<template>
  <div>
    <NavBar
      :title="scenarioMeta.name"
      helpTitle="Scenario Story Editor"
      :helpText="scenarioHelp.navbar"
      path="/scenario"
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
            @click="scenarioProps()"
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
            @click="toggleHandler($event, selectionReset, startSelectionToast, 'copy')"
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
        <b-field class="level-item">
          <b-input icon="filter-outline" placeholder="Filter" />
        </b-field>
      </template>
    </ToolBar>

    <!-- Titles -->
    <div ref="titles" class="sticky condition-bar">
      <div class="responsive-container condition-titles">
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
      <section class="responsive-container">
        <ValidationObserver ref="form" tag="form" @submit.prevent="onSubmit()">
          <!-- Frames -->
          <!-- NOTE: for some reason keying without the index causes strange update bahvior conflicting with scrollToFrame -->
          <SceneFrame
            v-for="(frame, index) in frameSet"
            :key="`${frame.id}_${index}`"
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
import ScenarioProperties from "~/components/ScenarioProperties";

// Import Helper Functions
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
    // FIXME: make this a mixin ?
    return {
      // import from JS file
      scenarioHelp: scenarioHelp,
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
  computed: {
    collapsedBtnProps() {
      const test = this.scenarioMeta.collapsed;
      return {
        icon: `${test ? "expand" : "collapse"}-all-outline`,
        name: `${test ? "Expand" : "Collapse"} All`
      };
    },
    // FIXME: make this 1 getter, formalize condition names
    ...mapGetters({
      scenarioMeta: "scenario/scenarioMeta",
      numConditions: "scenario/numConditions",
      frameSet: "scenario/frameSet"
    })
  },
  methods: {
    submitHandler() {
      this.$refs.submit.$el.click();
    },
    onSubmit() {
      this.$refs.form.validate().then(success => {
        if (success) {
          this.saveScenario();
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
    scrollToFrame(frameIndex) {
      this.$nextTick(() => {
        const headerHeight =
          this.$refs["toolbar"].$el.clientHeight +
          this.$refs["titles"].clientHeight;

        const frameTopPos = this.$refs.form.$el.children[
          frameIndex
        ].getBoundingClientRect().top;

        // Scroll so that the element is at the top of the view
        window.scrollTo({
          top: frameTopPos - headerHeight + window.pageYOffset,
          behavior: "smooth"
        });
      });
    },
    scenarioProps() {
      this.$buefy.modal.open({
        parent: this,
        component: ScenarioProperties,
        hasModalCard: true,
        trapFocus: true
      });
    },
    downloadZip() {
      this.$buefy.toast.open({
        message: "Zip download will begin momentarily.",
        type: "is-success"
      });

      // FIXME: add id?
      this.$axios.get("/api/v1/s/SomeScenarioID/zip");
    },
    ...mapActions({
      addCondition: "scenario/addCondition",
      removeCondition: "scenario/removeCondition",
      saveScenario: "scenario/saveScenario",
      updateFrames: "scenario/updateFrames",
      updateMeta: "scenario/updateMeta",
      copyScene: "scenario/copyScene",
      copyCondition: "scenario/copyCondition"
    }),
    //FIXME: make collapsing VueX independent
    collapseAll() {
      const entry = {
        key: "collapsed",
        val: !this.scenarioMeta.collapsed
      };

      this.updateMeta(entry);
      this.updateFrames(entry);
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
  margin-top: 2rem;
  overflow-x: hidden;
  /* Sticky below toolbar */
  top: 4rem;
  margin-bottom: 0.25rem;
  background-color: #fffe;
}

.condition-titles {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 3rem;
  padding-left: 75px;
}

.condition-title {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 0 0 350px;
  margin-right: 30px;
}

.select-title {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 5;
  // FIXME: use Bulma SASS $radius-large variable
  // Use mixin of .has-radius-large instead
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: #007aff50;
  }

  &:active {
    background-color: #0a84ff64;
  }
}

.close-button {
  color: red;
  /* Shift left so title is centerd */
  width: 1rem;
  margin-left: -1rem;

  &:hover {
    color: red;
  }
}

.scrollable {
  overflow-y: hidden;
}
</style>
