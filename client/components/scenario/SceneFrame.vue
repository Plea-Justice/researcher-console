<template>
  <div class="frame-wrapper-column">
    <div class="frame-wrapper-row">
      <p class="frame-index">{{ frameIndex + 1 }}</p>

      <div class="frame box">
        <!-- Sidebar -->
        <aside v-show="frame.size || !isOnly" class="sidebar buttons">
          <b-button
            v-if="env.MODE === 'development'"
            :label="frame.size.toString()"
            type="is-static"
          />

          <!-- Collapse Button -->
          <b-button
            v-show="!isOnly"
            @click="collapseFrame()"
            :icon-left="`chevron-${collapsed ? 'down' : 'up'}`"
            :disabled="isSelectable"
            type="is-text"
            size="is-medium"
          />

          <!-- Move Up/Down Buttons -->
          <b-button
            v-show="!isFirst"
            @click="moveUp()"
            :disabled="isSelectable"
            type="is-light"
            size="is-medium"
            icon-left="arrow-up"
          />
          <b-button
            v-show="!isLast"
            @click="moveDown()"
            :disabled="isSelectable"
            type="is-light"
            size="is-medium"
            icon-left="arrow-down"
          />

          <!-- Remove Frame Button -->
          <b-button
            v-show="!collapsed"
            @click="removeFrameHelper(frame.id)"
            :disabled="isSelectable"
            type="is-text"
            class="has-text-danger"
            icon-left="trash-alt"
            size="is-medium"
          />
        </aside>

        <div
          class="frame-content"
          :class="{ 'frame-content-collapsed': collapsed }"
          :style="{ '--num-scenes': this.frame.scenes.length }"
        >
          <div class="frame-header">
            <form-group
              :validator="$v.label"
              attribute="Scene Label"
              class="frame-header-item"
              grouped
              v-slot="{ maxlength }"
            >
              <b-input
                ref="focus_target"
                :value="frame.label"
                @input="setLabel($event)"
                :maxlength="maxlength"
                :placeholder="`Scene ${frameIndex + 1} Label`"
                class="absolute-counter"
                expanded
              />
            </form-group>

            <div
              v-if="(frame.size > 1 || collapsed) && conditionSet.length > 1"
              class="frame-header-item"
            >
              <b-tooltip
                :label="sceneCounterLabel"
                position="is-right"
                animated
              >
                <b-button
                  :label="uniqueScenes.toString()"
                  :class="{
                    'is-info': uniqueScenes > 1,
                    'is-dark': !frame.size,
                  }"
                  class="is-static"
                  style="color: white"
                  disabled
                />
                <!--TEMP: color: white fixes is-static not being fully compatible with .is-info -->
              </b-tooltip>
            </div>
          </div>
          <div v-show="!collapsed" class="frame-scenes">
            <div
              v-for="(scene, index) in sceneSet"
              :key="scene.id"
              class="scene"
            >
              <!-- Bound Scene -->
              <Scene
                v-if="typeof scene.props === 'string'"
                :bound="scene.id"
                :scene="getSiblingScene(scene.props)"
                :index="index"
                :collapsed="collapsed"
              />

              <!-- Regular (or Blank) Scene -->
              <Scene
                v-else
                @selected="$emit('selected', $event)"
                :scene="scene"
                :index="index"
                :collapsed="collapsed"
                :selectable="isSelectable"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="wrap-footer">
      <b-button
        v-show="!(isLast && !frame.size)"
        @click="addFrameHelper(frame.id)"
        :disabled="isSelectable"
        label="Insert Scene"
        type="is-light"
        size="is-small"
        icon-left="plus"
      />
    </div>
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Bus
import { EventListener } from "~/bus/eventbus";

// Import Vuelidate Rules
import { helpers, required, maxLength } from "vuelidate/lib/validators";

// Import Components
import Scene from "~/components/scenario/Scene";

// Import Helper Functions
import { debounce } from "~/assets/util";

export default {
  name: "SceneFrame",
  components: { Scene },
  props: {
    frame: {
      type: Object,
      required: true,
    },
    frameIndex: {
      type: Number,
      required: true,
    },
    isFirst: {
      type: Boolean,
      required: false,
    },
    isLast: {
      type: Boolean,
      required: false,
    },
    selectable: {
      type: [Boolean, Object],
      required: false,
      default: false,
    },
  },
  data() {
    return {
      // Env
      env: { MODE: process.env.MODE },

      collapsed: false,
      // frame validated props
      label: this.frame.label,
    };
  },
  validations() {
    const alphaNumSpace = helpers.regex(
      "alphaNumSpace",
      /^ ?([a-zA-Z0-9]+ ?)*$/
    );

    return {
      label: {
        // This should be updated to whatever character set we want to allow for Qualtrics stuff
        required,
        alphaNumSpace,
        maxLength: maxLength(25),
      },
    };
  },
  mounted() {
    // Capture Collapse events
    EventListener.collapseAll((collapse) => {
      if (collapse != this.collapsed) this.collapseFrame();
    });

    // Automatically force raise frame errors when scenes starts being added
    const unwatch = this.$watch("uniqueScenes", function (newValue) {
      console.log(newValue);
      if (newValue > 0) {
        this.$v.label.$touch();
        this.updateFrameErrors({
          id: this.frame.id,
          valid: !this.$v.label.$invalid,
        });
        unwatch();
      }
    });
  },
  watch: {
    isOnly() {
      if (this.isOnly && this.collapsed) this.collapsed = false;
    },
  },
  computed: {
    isOnly() {
      return this.isFirst && this.isLast;
    },
    isSelectable() {
      // Filter out selections in wrong frame
      let result = this.selectable;
      if (typeof this.selectable !== "boolean") {
        if (
          this.selectable.filters.includes("frame") &&
          this.selectable.parent.frame !== this.frameIndex
        )
          result = false;
      }

      return result;
    },
    sceneCounterLabel() {
      let label = "No Scenes";
      if (this.frame.size) {
        label =
          this.uniqueScenes > 1
            ? `${this.uniqueScenes} unbound conditions`
            : "Bound across all conditions";
      }

      return label;
    },
    ...mapGetters({
      getSceneSet: "scenario/sceneSet",
      conditionSet: "scenario/conditionSet",
    }),
    sceneSet() {
      return this.getSceneSet(this.frame.id);
    },
    showSceneCount() {
      return (
        (this.frame.size > 1 || this.collapsed) && this.conditionSet.length > 1
      );
    },
    uniqueScenes() {
      return !this.frame.size
        ? 0
        : this.sceneSet.reduce(
            (acc, curr) => (typeof curr.props !== "string" ? acc + 1 : acc),
            0
          );
    },
  },
  methods: {
    focus() {
      this.$refs.focus_target.focus();
    },
    collapseFrame() {
      this.collapsed = !this.collapsed;
    },
    ...mapActions({
      setFrameLabel: "scenario/setFrameLabel",
      updateFrameErrors: "scenario/updateFrameErrors",
      moveFrameUp: "scenario/moveFrameUp",
      moveFrameDown: "scenario/moveFrameDown",
      addFrame: "scenario/addFrame",
      removeFrame: "scenario/removeFrame",
    }),
    setLabel: debounce(function (newValue) {
      this.label = newValue;
      this.$v.label.$touch();
      this.setFrameLabel({
        id: this.frame.id,
        value: newValue,
        valid: !this.$v.label.$invalid,
      });
    }, 250),
    moveUp() {
      this.moveFrameUp(this.frame.id);
      // emit the frameIndex that must be traveled to
      this.$emit("scroll-to", { frameIndex: this.frameIndex - 1 });
    },
    moveDown() {
      this.moveFrameDown(this.frame.id);
      this.$emit("scroll-to", { frameIndex: this.frameIndex + 1 });
    },
    addFrameHelper(frameId) {
      this.addFrame(frameId);
      this.$emit("scroll-to", { frameIndex: this.frameIndex + 1 });
    },
    removeFrameHelper(frameId) {
      this.removeFrame(frameId);
      // Make this a not smooth scroll, just want to re-allign frame
      this.$emit("scroll-to", {
        frameIndex: this.frameIndex ? this.frameIndex - 1 : 0,
        smooth: false,
      });
    },
    getSiblingScene(sceneId) {
      for (const scene of this.sceneSet) if (scene.id === sceneId) return scene;
    },
  },
};
</script>

<!-- Global Styles -->
<style lang="scss">
.collapsing-counter .counter.is-invisible {
  display: none;
}

.absolute-counter > .input ~ .counter {
  position: absolute;
  margin: 0 !important;
  right: 1em;
  top: 50%;
  transform: translateY(-50%);
}

.absolute-counter > .input + .icon + .counter {
  right: 0.5em + 2.5em;
}

// FIXME: continued fixes for textarea icon
.control > .textarea + .icon {
  top: -0.2em;
}
</style>

<style lang="scss" scoped>
// This is the default Bulma .box padding

.frame-wrapper-column {
  display: flex;
  flex-direction: column;
  width: max-content;
}

.frame-wrapper-row {
  display: flex;
  flex-direction: row;
  position: relative;
}

.frame-index {
  position: absolute;
  align-self: center;
  left: -40px;
  font-size: 2rem;
  color: $grey;
}

.frame {
  display: flex;
  height: max-content;
  width: min-content;
  align-items: stretch;
  // Fix box model for box-shadow
  margin-top: 1px;
  // Remove bottom margin from box (leave 1px for box model)
  margin-bottom: 1px;
}

.box {
  padding: $framePadding;
}

.frame-content-collapsed {
  display: flex;
  align-items: center;

  $scene: $frameSceneGap + $sceneWidth;
  min-width: calc(#{$scene} * var(--num-scenes) - #{$frameSceneGap});
  width: max-content;
}

.frame-content {
  display: flex;
  flex-direction: column;
}

.frame-header {
  display: flex;
  flex-direction: row;
  width: max-content;

  position: sticky;
  z-index: $buefyOverlapIndex - 1;
  left: $framePadding;

  // Everything except last child & > :not(:last-child)
  & > :nth-last-child(n + 2) {
    margin-right: $frameSceneGap;
  }
}

.frame-header-item {
  width: $sceneWidth;
}

// If .frame-header-item is a .field clear the fields margin as it can interfere
.frame-header-item.field {
  margin-bottom: 0;
}

.frame-scenes {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  margin-top: 1.25rem;
  // Everything except last child & > :not(:last-child)
  & > div:nth-last-of-type(n + 2) {
    margin-right: $frameSceneGap;
  }
}

.wrap-footer {
  position: sticky;
  left: 0;
  max-width: calc(100vw - #{$responsiveContainerSpacing} * 2);
  padding-left: $frameSideBarWidth;
  display: flex;
  justify-content: center;
  margin-top: $framePadding;
  margin-bottom: $framePadding;
}

.sidebar {
  display: flex;
  flex-direction: column;
  flex-basis: $frameSideBarBasis;
  margin-right: $frameSideBarMargin;
  // Get rid of margin-bottom creating whitespace
  margin-bottom: 0;

  // IMPORTANT: Margins need !important to properly overwrite Buefy button margins
  & > :first-child {
    // reset unwanted button margins
    margin: 0 0 10px !important;
  }

  // Everything except first & last child
  & > :nth-child(n + 2):nth-last-child(n + 2) {
    margin: 0 0 10px !important;
  }

  & > :last-child {
    // scene-close-button-font-size-difference (1.25 - 1) + ...
    // ((0.25rem + $cardHeadFootPadding) / 2)
    // adjusts for making last button look like it's on the same plane
    // due to scene's box-shadow
    margin: auto 0 2px !important;
  }
}

.scene {
  display: flex;
  width: $sceneWidth;
}
</style>
