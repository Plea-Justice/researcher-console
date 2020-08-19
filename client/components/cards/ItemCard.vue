<template>
  <GenericCard
    @remove="$emit('remove', item.id)"
    @selected="$emit('selected', item.id)"
    :close="close"
    :selectable="selectable"
  >
    <template v-slot:header>
      <slot name="header" />

      <template v-if="item">
        <!-- If header is in default mode print name w or w/o link -->
        <h1 class="subtitle center-header">
          <n-link v-if="link" :to="item.id" class="link-animate" append>
            {{
            item.name
            }}
          </n-link>
          <template v-else>{{ item.name }}</template>
        </h1>
      </template>
    </template>

    <template v-slot:default>
      <slot name="default" />
    </template>

    <template v-slot:footer>
      <b-button
        v-if="save"
        class="clear-button-margin"
        type="is-primary"
        tag="input"
        native-type="submit"
        value="Save"
        expanded
      />
      <b-button v-if="edit" @click="$emit('edit', item.id)" icon-left="pencil-alt" />
    </template>
  </GenericCard>
</template>

<script>
// Import Components
import GenericCard from "~/components/cards/GenericCard";

export default {
  name: "ItemCard",
  components: { GenericCard },
  props: {
    item: {
      type: Object,
      required: false
    },
    value: {
      type: Object,
      required: false
    },
    link: {
      type: Boolean,
      required: false,
      default: false
    },
    save: {
      type: Boolean,
      required: false,
      default: false
    },
    // **** GenericCard Props ****
    close: {
      type: Boolean,
      required: false
    },
    edit: {
      type: Boolean,
      required: false
    },
    selectable: {
      type: Boolean,
      required: false,
      default: false
    }
  }
};
</script>

<style scoped>
.center-header {
  margin-left: auto;
  margin-right: auto;
}
</style>
