<template>
  <div>
    <form @submit.prevent="onSubmit()">
      <b-field label="Add Tag Set">
        <b-input v-model.trim="groupName" />
      </b-field>
    </form>

    <b-field v-for="tagSet in tagSets" :key="tagSet.id" :label="tagSet.name">
      <b-taginput
        :value="tagSet.tags"
        field="name"
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
import { nanoid } from "nanoid/non-secure";
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
