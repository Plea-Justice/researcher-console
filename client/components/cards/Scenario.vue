<template>
  <ItemCard
    v-on="$listeners"
    v-bind="$attrs"
    :item="{ id: scenario.id, name: scenario.name }"
    itemType="Scenario"
    :link="link"
  >
    <p class="content description" v-if="scenario.description">
      {{ scenario.description }}
    </p>
    <div class="content is-small">
      <span v-if="scenario.modified !== scenario.created">
        Last Modified {{ scenario.modified | timeToNow }}
        <br />
      </span>
      <span>Created {{ scenario.created | timeToNow }}</span>
      <span class="is-pulled-right">{{ scenario.owner }}</span>
      <p v-if="scenario.citation">Citation: {{scenario.citation}}</p>
    </div>
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
    },
    link: {
      type: Boolean,
      default: true,
      required: false
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
