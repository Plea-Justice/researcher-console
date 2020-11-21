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
            <div class="condition-header buttons has-addons">
              <div v-if="isSelectable(condition.id)" class="condition-select" />

              <b-button
                @click="$emit('remove', condition.id)"
                type="is-danger is-light"
                size="is-small"
                icon-left="trash"
                class="custom-small"
              />
              <b-button size="is-small" type="is-primary is-light is-static">
                <h1 class="subtitle">Condition {{ index + 1 }}</h1>
              </b-button>
              <b-button
                @click="openConditionOptions(condition, index)"
                type="is-light"
                size="is-small"
                icon-left="cog"
                class="custom-small"
              />
            </div>

            <b-taglist>
              <b-tag
                v-for="tag in condition.tags"
                :key="tag.id"
                attached
                closable
                close-type="is-danger is-light"
                :aria-close-label="`Remove ${tag} tag`"
              >
                {{ tag.name }}
              </b-tag>
            </b-taglist>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Import VueX
import { mapGetters } from "vuex";
import ConditionOptions from "~/components/modals/ConditionOptions/ConditionOptions";

export default {
  props: {
    selectable: [Object, Boolean],
  },
  computed: {
    ...mapGetters({
      getConditionSet: "scenario/conditionSet",
      tagsSet: "scenario/tagsSet",
      numScenes: "scenario/numScenes",
    }),
    conditionSet() {
      return this.getConditionSet.map((condition) => ({
        ...condition,
        tags: this.tagsSet(condition.tags),
      }));
    },
    titleBarCssVars() {
      return {
        "--frame-sidebar-active": this.numScenes ? 1 : 0,
        "--num-conditions": this.conditionSet.length,
      };
    },
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
    openConditionOptions(condition, index) {
      this.$buefy.modal.open({
        parent: this,
        component: ConditionOptions,
        props: { index, condition },
        hasModalCard: true,
        trapFocus: true,
      });
    },
  },
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
  background-color: $white-bis;
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

// FIXME: this isn't lined up properly
.conditions {
  display: flex;

  // FIXME: make all of these use the gap property
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
}

.condition-header {
  margin-bottom: 0;
  position: relative;
}

.condition-select {
  @include selectionMask();
  // Height accounts for .button margin-bottom
  height: calc(100% - 0.5rem);
  width: 105%;
  top: 0;
  left: -2.5%;
  border-radius: $radius-large;
}
</style>
