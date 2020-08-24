<template>
  <div class="frame-wrapper-column">
    <div class="frame-wrapper-row">
      <p class="frame-index">{{ frameIndex + 1 }}</p>

      <div class="frame box">
        <!-- Sidebar -->
        <aside v-show="frame.size || !isOnly" class="sidebar buttons">
          <!-- Collapse Button -->
          <b-button
            v-show="!isOnly"
            @click="collapseFrame()"
            :icon-left="`chevron-${collapsed ? 'down' : 'up'}`"
            type="is-text"
            size="is-medium"
          />

          <!-- Move Up/Down Buttons -->
          <b-button
            v-show="!isFirst"
            @click="moveUp()"
            type="is-light"
            size="is-medium"
            icon-left="arrow-up"
          />
          <b-button
            v-show="!isLast"
            @click="moveDown()"
            type="is-light"
            size="is-medium"
            icon-left="arrow-down"
          />

          <!-- Remove Frame Button -->
          <b-button
            v-show="!collapsed"
            @click="removeFrameHelper(frame.id)"
            type="is-danger is-light"
            icon-left="times"
            size="is-medium"
          />
        </aside>

        <div
          :class="{ 'frame-content-collapsed': collapsed }"
          :style="{ '--num-scenes': this.frame.scenes.length }"
        >
          <div class="frame-header">
            <form-group class="frame-header-item" :validator="$v.label" grouped>
              <b-input
                ref="focus_target"
                :value="frame.label"
                @input="setLabel($event)"
                placeholder="Scenes Label (Optional)"
                expanded
              />
            </form-group>
            <div v-if="frame.size > 1 || collapsed" class="frame-header-item">
              <b-tooltip
                :label="!frame.size ? 'No Scenes' : uniqueScenes > 1 ? `${uniqueScenes} Unique Scenes` : 'Same Across Conditions'"
                position="is-bottom"
                animated
              >
                <b-button
                  :class="{ 'is-info': uniqueScenes > 1, 'is-dark': !frame.size }"
                  disabled
                >{{uniqueScenes}}</b-button>
              </b-tooltip>
            </div>
          </div>
          <div v-show="!collapsed" class="frame-scenes">
            <div v-for="(scene, index) in sceneSet" :key="scene.id" class="scene">
              <Scene
                v-if="typeof scene.props === 'string'"
                :bound="scene.id"
                :scene="getSiblingScene(scene.props)"
                :collapsed="collapsed"
              />

              <Scene
                v-else
                @selected="$emit('selected', $event)"
                :scene="scene"
                :collapsed="collapsed"
                :selectable="isSelectable(index, scene.id)"
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
        type="is-light"
        size="is-medium"
        icon-left="plus"
      />
    </div>
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Bus
import { EventBus, EventListener } from "~/bus/eventbus";

// Import Vuelidate Rules
import { alphaNum, maxLength } from "vuelidate/lib/validators";

// Import Components
import GenericCard from "~/components/cards/GenericCard";
import Scene from "~/components/Scene";

// Import Helper Functions
import { debounce } from "~/assets/util";

export default {
  name: "SceneFrame",
  components: { Scene, GenericCard },
  props: {
    frame: {
      type: Object,
      required: true
    },
    frameIndex: {
      type: Number,
      required: true
    },
    isFirst: {
      type: Boolean,
      required: false
    },
    isLast: {
      type: Boolean,
      required: false
    },
    selectable: {
      type: [Boolean, Object],
      required: false,
      default: false
    }
  },
  mounted() {
    EventListener.collapseAll(collapse => {
      if (collapse != this.collapsed) this.collapseFrame();
    });
  },
  data() {
    return {
      collapsed: false,
      // frame validated props
      label: this.frame.label
    };
  },
  validations: {
    label: {
      alphaNum,
      maxLength: maxLength(20)
    }
  },
  computed: {
    isOnly() {
      return this.isFirst && this.isLast;
    },
    ...mapGetters({
      getSceneSet: "scenario/sceneSet"
    }),
    sceneSet() {
      return this.getSceneSet(this.frame.id);
    },
    uniqueScenes() {
      return !this.frame.size
        ? 0
        : this.sceneSet.reduce(
            (acc, curr) => (typeof curr.props !== "string" ? acc + 1 : acc),
            0
          );
    }
  },
  methods: {
    collapseFrame() {
      this.collapsed = !this.collapsed;
    },
    isSelectable(index, id) {
      let result = true;
      if (typeof this.selectable === "boolean") result = this.selectable;
      else {
        if (
          this.selectable.filters.includes("condition") &&
          index !== this.selectable.parent[1]
        )
          result = false;

        if (this.selectable.selectionList.includes(id)) result = false;
      }

      return result;
    },
    ...mapActions({
      setFrameLabel: "scenario/setFrameLabel",
      moveFrameUp: "scenario/moveFrameUp",
      moveFrameDown: "scenario/moveFrameDown",
      addFrame: "scenario/addFrame",
      removeFrame: "scenario/removeFrame"
    }),
    setLabel: debounce(function(newValue) {
      this.label = newValue;
      this.$v.label.$touch();
      this.setFrameLabel({ id: this.frame.id, value: newValue });
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
        smooth: false
      });
    },
    getSiblingScene(sceneId) {
      for (const scene of this.sceneSet) if (scene.id === sceneId) return scene;
    }
  }
};
</script>

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
  left: -3vw;
  font-size: 2rem;
  color: $grey;
}

.frame {
  display: flex;
  height: max-content;
  width: min-content;
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
  width: calc(#{$scene} * var(--num-scenes) - #{$frameSceneGap});
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
