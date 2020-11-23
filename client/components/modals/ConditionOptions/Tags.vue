<template>
  <div class="modal-card">
    <form @submit.prevent="onSubmit()">
      <header class="modal-card-head">
        <p class="modal-card-title">Condition {{ index + 1 }} - Tags</p>
      </header>
      <section class="modal-card-body">
        <p v-if="isEmpty">
          <span v-if="allTagSets.length">
            Variable names have been defined in the
            <a
              aria-label="open menu to add tag sets"
              @click="openScenarioOptions()"
            >
              Scenario Options</a
            >, but they have not been given levels.
          </span>

          <span v-else>
            No variable names have been defined in
            <a
              aria-label="open menu to add tag sets"
              @click="openScenarioOptions()"
            >
              Scenario Options</a
            >.
          </span>

          <span
            >Add variables and then return here to label this condition.</span
          >
        </p>

        <div v-else>
          <div class="mb-2" v-if="!conditionTags.length">
            <p>No tags selected.</p>
            <p>
              Label this condition by selecting a level for each of the
              variables below.
            </p>
          </div>
          <b-taglist v-else>
            <b-tag v-for="tag in conditionTags" :key="tag">
              {{ tag }}
            </b-tag>
          </b-taglist>

          <b-field
            v-for="tagSet in tagSets"
            :key="tagSet.id"
            :label="tagSet.name"
          >
            <b-select
              :value="getSetTagId(tagSet)"
              @input="tagCondition($event, tagSet)"
            >
              <option :value="null">None</option>
              <option v-for="tag in tagSet.tags" :key="tag.id" :value="tag.id">
                {{ tag.name }}
              </option>
            </b-select>
          </b-field>
        </div>
      </section>
      <footer class="modal-card-foot">
        <b-button
          label="Done"
          type="is-primary"
          native-type="submit"
          expanded
        />
      </footer>
    </form>
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import ScenarioOptions from "~/components/modals/ScenarioOptions/ScenarioOptions";

export default {
  props: {
    index: {
      type: Number,
      required: true,
    },
    condition: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      groupName: "",
    };
  },
  computed: {
    ...mapGetters({
      allTagSets: "scenario/tagSets",
      conditionSet: "scenario/conditionSet",
    }),
    // Due to a limitation with Bulma tags must be extracted from the getter as modal props ar not reactive
    // and the only "official" workaround is only more cumbersome
    conditionTags() {
      return (
        this.conditionSet.find(
          (condition) => condition.id === this.condition.id
        ).tags || []
      );
    },
    tagSets() {
      return this.allTagSets.filter((tagSet) => tagSet.tags.length);
    },
    isEmpty() {
      return !this.tagSets.length;
    },
  },
  methods: {
    openScenarioOptions() {
      this.$buefy.modal.open({
        parent: this,
        props: { openTab: "tags" },
        component: ScenarioOptions,
        hasModalCard: true,
      });
    },
    getSetTagId(tagSet) {
      return (
        tagSet.tags.find((tag) => this.conditionTags.includes(tag.id))?.id ??
        null
      );
    },
    ...mapActions({
      updateConditionTags: "scenario/updateConditionTags",
    }),
    tagCondition(tagId, tagSet) {
      const oldTagId = this.getSetTagId(tagSet);

      if (tagId !== oldTagId) {
        const newConditionTags =
          oldTagId === null
            ? this.conditionTags
            : this.conditionTags.filter((tagId) => tagId !== oldTagId);

        this.updateConditionTags({
          conditionId: this.condition.id,
          tags:
            tagId === null ? newConditionTags : [...newConditionTags, tagId],
        });
      }
    },
    onSubmit() {
      this.$parent.close();
    },
  },
};
</script>

<style lang="scss" scoped>
/* FIXME: come up with a common style fix for cards */
.modal-card {
  min-width: 25vw;
  max-width: 90vw;
  width: auto;
  max-height: 90vh;
  margin-left: auto !important;
  margin-right: auto !important;

  & > .modal-card-body {
    //FIXME: set max-height
  }
}
</style>