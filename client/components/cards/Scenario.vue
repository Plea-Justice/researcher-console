<template>
  <ItemCard
    v-on="$listeners"
    v-bind="$attrs"
    :item="{ id: scenario.id, name: scenario.name }"
    itemType="Scenario"
    link
  >
    <p class="content description" v-if="scenario.description">
      {{ scenario.description }}
    </p>
    <p class="content is-small">
      <span v-if="scenario.modified !== scenario.created">
        Last Modified {{ scenario.modified | timeToNow }}
        <br />
      </span>
      <span>Created {{ scenario.created | timeToNow }}</span>
    </p>
    <template v-slot:footer>
      <b-taglist style="margin-left: auto">
        <b-tag v-if="scenario.public" type="is-info">Public</b-tag>
      </b-taglist>
    </template>
  </ItemCard>
</template>

<script>
// Import Components
import ItemCard from "~/components/cards/ItemCard";

export default {
  components: { ItemCard },
  props: {
    scenario: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped lang="scss">
.description {
  margin-bottom: auto;
  padding-bottom: 1.5rem;
  overflow-wrap: anywhere;
}
</style>
