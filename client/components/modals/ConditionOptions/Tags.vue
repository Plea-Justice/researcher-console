<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Condition {{ index + 1 }} - Tags</p>
    </header>
    <section class="modal-card-body">
      <p class="content" v-if="isEmpty">
        <span v-if="allTagSets.length">
          Variable(s) defined in the
          <a
            aria-label="open menu to add tag sets"
            @click="openScenarioOptions()"
          >
            Scenario Options,
          </a>
          <br />
          but they have not been given levels.
        </span>

        <span v-else>
          No variables defined in
          <a
            aria-label="open menu to add tag sets"
            @click="openScenarioOptions()"
          >
            Scenario Options.
          </a>
          <br />
          Add variables first to label this condition.
        </span>
      </p>

      <div v-else>
        <p class="content" v-if="!conditionTags.length">
          No labels selected, Label this condition by selecting a level for each
          of the variables below.
        </p>

        <b-taglist v-else>
          <b-tag v-for="tag in conditionTags" :key="tag">
            {{ tag }}
          </b-tag>
        </b-taglist>

        <div class="fields">
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
      </div>
    </section>
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
  },
};
</script>

<style scoped>
.fields {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>

