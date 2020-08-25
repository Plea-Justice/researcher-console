<template>
  <form @submit.prevent="$emit('submit')">
    <ItemCard save>
      <template v-slot:header>
        <b-button @click="$emit('close')" icon-left="times" type="is-text" />

        <b-input
          ref="focus_target"
          v-model="scenarioForm.name"
          placeholder="Name"
          class="flex-grow"
          required
        />
      </template>

      <b-input
        v-model="scenarioForm.description"
        type="textarea"
        placeholder="Description"
        customClass="has-fixed-size"
        maxlength="100"
      />
    </ItemCard>
  </form>
</template>

<script>
// Import Components
import ItemCard from "~/components/cards/ItemCard";

export default {
  components: { ItemCard },
  props: {
    scenarioForm: {
      type: Object,
      required: true
    }
  },
  mounted() {
    this.focus();
  },
  methods: {
    focus() {
      this.$refs.focus_target.focus();
    }
  }
};
</script>

<style scoped>
.flex-grow {
  flex-grow: 1;
}
</style>
