<template>
  <!-- Titles -->
  <div class="titlebar-wrapper">
    <div class="titlebar padded-responsive-container">
      <div :style="titleBarCssVars" class="title-wrapper">
        <div class="conditions">
          <div
            v-for="(condition, index) in conditionSet"
            :key="condition.id"
            class="condition"
          >
            <div class="condition-title">
              <div
                v-if="isSelectable(condition.id)"
                @click="$emit('selected', condition.id)"
                class="condition-select"
              />

              <b-button
                @click="$emit('remove', condition.id)"
                type="is-danger is-light"
                icon-left="times"
                class="condition-remove"
              />
              <h1 class="subtitle">Condition {{ index + 1 }}</h1>
            </div>

            <b-field grouped class="tag-list">
              <div v-for="tag in condition.tags" :key="tag" class="control">
                <b-tag
                  attached
                  closable
                  close-type="is-danger is-light"
                  :aria-close-label="`Remove ${tag} tag`"
                  @close="removeTag(condition, tag)"
                  >{{ tag }}</b-tag
                >
              </div>

              <div class="control">
                <b-tag
                  @close="toggleTagInput(index)"
                  attached
                  closable
                  close-type="is-light"
                  close-icon="plus"
                  aria-close-label="Add condition label"
                  >Label</b-tag
                >
              </div>
            </b-field>
          </div>
        </div>

        <div v-if="showTagInput" class="tagbar">
          <b-button @click="closeTagInput()" type="is-text" icon-left="times" />
          <b-field class="tag-input">
            <b-input
              v-model="tag"
              @keyup.native.enter="AddTag()"
              placeholder="Add Condition Label"
              expanded
            />
          </b-field>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

export default {
  props: {
    selectable: [Object, Boolean]
  },
  data() {
    return {
      showTagInput: false,
      bindInputToCondition: null,
      tag: ""
    };
  },
  computed: {
    ...mapGetters({
      conditionSet: "scenario/conditionSet",
      numScenes: "scenario/numScenes"
    }),
    titleBarCssVars() {
      return {
        "--frame-sidebar-active": this.numScenes ? 1 : 0,
        "--num-conditions": this.conditionSet.length
      };
    }
  },
  methods: {
    isSelectable(id) {
      // Filter out selections in wrong condition
      let result = this.selectable;
      if (typeof this.selectable !== "boolean") {
        if (this.selectable.selectionList.includes(id)) result = false;
      }

      return result;
    },
    toggleTagInput(index) {
      this.showTagInput = !this.showTagInput;
      this.bindInputToCondition = this.showTagInput
        ? this.conditionSet[index]
        : null;
    },
    closeTagInput() {
      this.showTagInput = false;
      this.bindInputToCondition = null;
    },
    ...mapActions({
      updateTags: "scenario/updateTags"
    }),
    AddTag() {
      const condition = this.bindInputToCondition;
      this.updateTags({
        id: condition.id,
        tags: [...condition.tags, this.tag]
      });
      this.tag = "";
    },
    removeTag(condition, targetTag) {
      this.updateTags({
        id: condition.id,
        tags: condition.tags.filter(tag => tag != targetTag)
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.titlebar-wrapper {
  // Sticky below toolbar
  @include sticky();
  top: 4rem;

  margin-bottom: 1rem;

  // Width & sizing
  min-width: 100%;
  // width: max-content;

  // FIXME: background-color: $white-bis;
  background-color: hsla(0, 0%, 98%, 0.65);
}

// FIXME: conditionbar doesn't cover full width
.titlebar {
  width: max-content;

  padding-top: 0.5rem;
  padding-bottom: 0.5rem;

  margin-left: auto;
  margin-right: auto;
}

.title-wrapper {
  height: 100%;

  $scene: $frameSceneGap + $sceneWidth;
  width: calc(
    #{$scene} * var(--num-conditions) - #{$frameSceneGap} +
      var(--frame-sidebar-active) * #{$frameSideBarWidth} + #{$framePadding} * 2
  );

  padding-left: calc(
    #{$framePadding} + var(--frame-sidebar-active) * #{$frameSideBarWidth}
  );

  & > :nth-last-child(n + 2) {
    margin-bottom: 1rem;
  }
}

.conditions {
  display: flex;

  // Effectively flex-gap .condition
  & > :nth-last-child(n + 2) {
    margin-right: $frameSceneGap;
  }
}

.condition {
  display: flex;
  flex-direction: column;
  flex: 0 0 $sceneWidth;
  align-items: center;
  // For .select-title placement
}

.condition-title {
  display: flex;
  align-items: center;
  position: relative;
  margin-left: -1.75rem;
}

.tag-list {
  margin-top: 0.5rem;
}

.condition-select {
  @include selectionMask();
  height: 105%;
  width: 105%;
  border-radius: $radius-large;
}

.condition-remove {
  width: 1.5rem;
  height: 1.5rem;

  .icon {
    width: 1.5rem;
    height: 1.5rem;
  }
}

.condition-remove:not(:hover) {
  background-color: transparent !important;
}

.tagbar {
  display: flex;
  align-items: center;
  width: max-content;
  position: sticky;
  left: 1.25rem;

  & > :nth-last-child(n + 2) {
    margin-right: $frameSceneGap;
  }
}

.tag-input {
  width: $sceneWidth;
}
</style>
