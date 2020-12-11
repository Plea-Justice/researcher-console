<template>
  <div class="flex-fields">
    <form @submit.prevent="onSubmit()">
      <b-field
        label="Add Variable Name"
        message="Conditions can be labeled by level of these variables"
      >
        <b-input v-model.trim="groupName" placeholder="e.g. innocence" />
      </b-field>
    </form>

    <b-field
      v-for="tagSet in tagSets"
      :key="tagSet.id"
      :label="tagSet.name"
      :message="!tagSet.tags.length ? 'Add levels of this variable.' : ''"
    >
      <b-taginput
        :value="tagSet.tags"
        field="name"
        placeholder="e.g. innocent, guilty..."
        @add="addTagHelper({ setId: tagSet.id, name: $event })"
        @remove="removeTag({ setId: tagSet.id, tagId: $event.id })"
        aria-close-label="Delete this tag"
      />
    </b-field>
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import BTagInput from "~/components/form/BTagInput";

// Import Utils
import { toPascalCase } from "~/assets/util";

export default {
  components: { BTagInput },
  data() {
    return {
      groupName: "",
    };
  },
  computed: {
    ...mapGetters({
      tagSets: "scenario/tagSets",
    }),
  },
  methods: {
    ...mapActions({
      addTagSet: "scenario/addTagSet",
      addTag: "scenario/addTag",
      removeTag: "scenario/removeTag",
    }),
    onSubmit() {
      this.addTagSet({ name: toPascalCase(this.groupName) });
      this.groupName = "";
    },
    addTagHelper({ setId, name }) {
      this.addTag({ setId, name: toPascalCase(name) });
    },
  },
};
</script>

<style scoped>
.flex-fields {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
