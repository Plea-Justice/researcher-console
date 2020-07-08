<template>
  <div>
    <ToolBar ref="toolbar">
      <template v-slot:start>
        <div class="level-item buttons">
          <b-button @click="submitHandler()" type="is-primary">Save</b-button>
          <b-button @click="collapse()">{{
            `${isCollapsed ? "Expand" : "Collapse"} All`
          }}</b-button>
          <b-button @click="addCondition()">Add Condition</b-button>
          <b-button
            @click="toggleMode(Modes.COPY)"
            :type="EnabledModeBtnType(Modes.COPY)"
            :disabled="isDisabledMode(Modes.COPY)"
            >Copy</b-button
          >
        </div>
      </template>
      <template v-slot:end>
        <div class="level-item">
          <div class="buttons">
            <b-button
              @click="uploadModal()"
              type="is-primary"
              icon-left="file-upload"
              >Upload Asset</b-button
            >
            <b-button
              @click="downloadZip()"
              type="is-primary"
              icon-left="folder-download"
              >Download Package</b-button
            >
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
        <div
          v-for="index in numConditions"
          :key="index"
          class="condition-title"
        >
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
    <div
      @scroll="handleScroll($event)"
      ref="horizontalScroll"
      class="scrollable"
    >
      <section class="responsive-container">
        <ValidationObserver ref="form" tag="form" @submit.prevent="onSubmit()">
          <!-- Frames -->
          <!-- NOTE: for some reason keying without the index causes strange update bahvior conflicting with scrollToFrame -->
          <SceneFrame
            v-for="(frame, index) in frameSet"
            :key="`${frame.id}_${index}`"
            @scroll-to="scrollToFrame($event)"
            :frame="frame"
            :allCollapsed="isCollapsed"
            :isFirst="index === 0"
            :isLast="index === frameSet.length - 1"
            :selection="mode === Modes.COPY"
          />

          <b-button
            ref="submit"
            tag="input"
            native-type="submit"
            class="is-hidden"
          />
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

import ToolBar from "~/components/ToolBar";
import UploadModal from "~/components/UploadModal";
import SceneFrame from "~/components/SceneFrame";

// Import Helper Functions
import { throttle } from "~/assets/util";

export default {
  name: "Scenario",
  layout: "ScenarioLayout",
  components: { ToolBar, UploadModal, SceneFrame },
  data() {
    // FIXME: make this a mixin ?
    return {
      Modes: {
        DEFAULT: 0,
        COPY: 1,
        BIND: 2
      },

      // Set to DEFAULT mode
      mode: 0,
      isCollapsed: false
    };
  },
  async fetch({ store, params }) {
    await store.dispatch("scenario/getScenario", params.id);
    await store.dispatch("assets/getAssets");
  },
  computed: {
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
    // FIXME: make this a seperate component (ToolBarButton)
    isDisabledMode(ownMode) {
      return this.mode !== this.Modes.DEFAULT && this.mode !== ownMode;
    },
    EnabledModeBtnType(ownMode) {
      return this.mode === ownMode ? "is-success" : "";
    },
    toggleMode(ownMode) {
      this.mode =
        this.mode === this.Modes.DEFAULT ? ownMode : this.Modes.DEFAULT;
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
    collapse() {
      this.isCollapsed = !this.isCollapsed;
    },
    uploadModal() {
      this.$buefy.modal.open({
        parent: this,
        component: UploadModal,
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
      saveScenario: "scenario/saveScenario"
    })
  },
  head() {
    return {
      title: `${this.$siteConfig.title} | ${this.scenarioMeta.title}`,
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
  top: 5rem;
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
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 0 0 350px;
  margin-right: 30px;
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
