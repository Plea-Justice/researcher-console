<template>
  <div>
    <NavBar
      v-if="true"
      :title="scenarioMeta.name"
      path="/scenarios"
      helpTitle="Scenario Story Editor"
      helpText="The simulation storyline progresses downwards. Each column is the variation of the storyline that will be
        presented to participants subject to the experimental condition specified at the top of the column.
        Click 'Properties' to edit the survey link to which participants will be redirected when they complete
        the simulation. 'Download Package' will create a fully configured, zipped simulation package, ready to deploy
        on any web server."
    />
    <ToolBar ref="toolbar">
      <template v-slot:start>
        <div class="level-item buttons">
          <b-button @click="submitHandler()" type="is-primary" icon-left="content-save">Save</b-button>
          <b-button @click="scenarioProps()" icon-left="movie-edit-outline">Properties</b-button>
          <b-button
            @click="collapseAll()"
            :icon-left="collapsedBtnProps.icon"
          >{{ collapsedBtnProps.name }}</b-button>
          <b-button @click="addCondition()">Add Condition</b-button>
          <b-button
            @click="toggleMode(Modes.COPY, selectionReset, startSelectionToast, 'copy')"
            :type="EnabledModeBtnType(Modes.COPY)"
            :disabled="isDisabledMode(Modes.COPY)"
          >Copy</b-button>
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
import ScenarioProperties from "~/components/ScenarioProperties";
import SceneFrame from "~/components/SceneFrame";

// Import Helper Functions
import { throttle } from "~/assets/util";

// Define empty function
const noop = function() {};

export default {
  name: "Scenario",
  components: { NavBar, ToolBar, SceneFrame, ScenarioProperties },
  data() {
    // FIXME: make this a mixin ?
    return {
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
      this.mode = this.Modes.DEFAULT;
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
      }
    },
    // FIXME: make this a seperate component (ToolBarButton)
    isDisabledMode(ownMode) {
      return this.mode !== this.Modes.DEFAULT && this.mode !== ownMode;
    },
    EnabledModeBtnType(ownMode) {
      return this.mode === ownMode ? "is-success" : "";
    },
    toggleMode(ownMode, onUntoggle = noop, onToggle = noop, modeName = "") {
      if (this.mode === this.Modes.DEFAULT) {
        this.mode = ownMode;
        onToggle(modeName);
      } else {
        this.mode = this.Modes.DEFAULT;
        onUntoggle();
      }
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

        window.scrollTo({
          top: frameTopPos - headerHeight + window.pageYOffset,
          behavior: "smooth"
        });
      });

      // Scroll so that the element is at the top of the view
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
      let start = () => {
        this.$buefy.toast.open({message: 'Simulation download will begin shortly.', type: 'is-success'});
        window.location =`${this.$axios.defaults.baseURL}/api/v1/s/${this.scenarioMeta.id}/zip`
      }

      // TODO: Ask on unsaved, invalid, etc.
      if (!this.scenarioMeta.survey)
        this.$buefy.dialog.confirm({
          title: 'Survey Redirect Unset',
          message: 'No survey URL has been set. Set the survey URL in \'Properties\'.',
          confirmText: 'Download Anyway',
          type: 'is-danger',
          hasIcon: true,
          onConfirm: start
      });
      else
        start();
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
  },
  beforeRouteLeave(to, from, next) {
    this.$buefy.dialog.confirm({
      title: 'Leaving Scenario Editor',
      message: 'If you have made any changes, save them before leaving.',
      confirmText: 'Leave Page',
      type: 'is-danger',
      hasIcon: true,
      onConfirm: () => next()
    })
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
