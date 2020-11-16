<template>
  <p v-if="isEmpty">
    <span v-if="!allTagSets.length">
      Only empty tag sets exist,
      <a aria-label="open menu to add tag sets" @click="openScenarioOptions()">
        add tags.
      </a>
    </span>

    <span v-else>
      No tag sets exist,
      <a aria-label="open menu to add tag sets" @click="openScenarioOptions()">
        add tags sets.
      </a>
    </span>
  </p>

  <div v-else>
    <p v-if="!conditionTags.length">No tags selected</p>
    <b-taglist v-else>
      <b-tag v-for="tag in conditionTags" :key="tag">
        {{ tag }}
      </b-tag>
    </b-taglist>

    {{ conditionTags }}

    <b-field v-for="tagSet in tagSets" :key="tagSet.id" :label="tagSet.name">
      <b-select :value="conditionTags" @input="tagCondition($event)">
        <option :value="null">None</option>
        <option v-for="tag in tagSet.tags" :key="tag.id" :value="tag.id">
          {{ tag.name }}
        </option>
      </b-select>
    </b-field>
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import ScenarioOptions from "~/components/modals/ScenarioOptions/ScenarioOptions";

export default {
  props: {
    conditionId: {
      type: String,
      required: true,
    },
    conditionTags: {
      type: Array,
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
    }),
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
    getSetTag(tagSet) {
      return tagSet.tags.find((tag) => conditionTags.includes(tag.id)) || null;
    },
    ...mapActions({
      updateConditionTags: "scenario/updateConditionTags",
    }),
    tagCondition(tagId) {
      this.updateConditionTags({
        conditionId: this.conditionId,
        tags: [...this.conditionTags, tagId],
      });
    },
  },
};
</script>
