<template>
  <GenericCard
    @remove="$emit('remove', item.id)"
    @selected="$emit('selected', item.id)"
    :remove="remove"
    :selectable="selectable"
  >
    <template v-slot:header>
      <slot name="header" />

      <template v-if="item">
        <!-- If header is in default mode print name w or w/o link -->
        <h1 class="subtitle center-header">
          <n-link v-if="link" :to="item.id" class="link-animate" append>
            {{ item.name }}
          </n-link>
          <template v-else>{{ item.name }}</template>
        </h1>
      </template>
    </template>

    <template v-slot:default>
      <div class="test">
        <slot name="default" />
      </div>
    </template>

    <template v-slot:footer>
      <div>
        <b-button
          v-if="save"
          class="clear-button-margin"
          type="is-primary"
          tag="input"
          native-type="submit"
          value="Save"
          expanded
        />
        <div class="b-tooltips">
          <b-tooltip :label="`Delete ${itemType}`" position="is-bottom">
            <b-button
              v-if="remove"
              @click="$emit('remove')"
              type="is-danger"
              icon-left="trash"
            />
          </b-tooltip>
          <b-tooltip :label="`Edit ${itemType}`" position="is-bottom">
            <b-button
              v-if="edit"
              @click="$emit('edit', item.id)"
              icon-left="pencil-alt"
            />
          </b-tooltip>
          <b-tooltip :label="`Duplicate ${itemType}`" position="is-bottom">
            <b-button
              v-if="duplicate"
              @click="$emit('duplicate', item.id)"
              icon-left="clone"
            />
          </b-tooltip>
        </div>
      </div>
      <slot name="footer" />
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
    item: Object,
    itemType: {
      type: String,
      default: ""
    },
    value: Object,
    link: Boolean,
    save: Boolean,
    remove: Boolean,
    edit: Boolean,
    duplicate: Boolean,
    // **** GenericCard Props ****
    selectable: Boolean
  }
};
</script>

<style scoped>
.center-header {
  margin-left: auto;
  margin-right: auto;
}
</style>
