<template>
  <GenericCard
    @remove="$emit('remove', item.id)"
    @selected="$emit('selected', item.id)"
    :remove="remove"
    :selectable="selectable"
  >
    <template v-slot:header>
      <slot name="header" />
      <div v-if="item" class="header-wrapper">
        <!-- If header is in default mode print name w or w/o link -->
        <b-tooltip
          :active="showTooltip"
          :label="item.name"
          posiiton="is-top"
          type="is-info is-light"
          style="width: inherit"
        >
          <h1 ref="title" class="subtitle overflow-title">
            <n-link v-if="link" :to="item.id" class="link-animate" append>
              {{ item.name }}
            </n-link>
            <template v-else>{{ item.name }}</template>
          </h1>
        </b-tooltip>
      </div>
    </template>

    <template v-slot:default>
      <div class="card-content-wrapper">
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
              @click="$emit('remove', item.id)"
              type="is-danger"
              icon-left="trash-alt"
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
  },
  data() {
    return {
      showTooltip: false
    };
  },
  mounted() {
    const { height } = this.$refs.title.getBoundingClientRect();
    this.$refs.title.style.whiteSpace = "nowrap";

    const { height: newHeight } = this.$refs.title.getBoundingClientRect();
    this.$nextTick(() => {
      this.showTooltip = newHeight < height;
    });
  }
};
</script>

<style scoped>
.header-wrapper {
  width: 100%;
  text-align: center;
}

.overflow-title {
  /* Applied dynamically in mounted() -> white-space: nowrap; */
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
</style>
