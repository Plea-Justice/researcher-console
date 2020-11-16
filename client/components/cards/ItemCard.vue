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
        <!-- FIXME: consider moving this right to the asset/scenario cards -->
        <!-- If header is in default mode print name w or w/o link -->
        <b-tooltip
          :active="showTooltip"
          :label="item.name"
          position="is-top"
          type="is-primary is-light"
          style="width: inherit"
        >
          <h1 ref="title" class="subtitle">
            <n-link
              v-if="link"
              :to="item.id"
              class="link-animate"
              style="display: inline-grid"
              append
            >
              <span class="overflow-title">{{ item.name }}</span>
            </n-link>
            <span class="overflow-title" style="display: block" v-else>
              {{ item.name }}
            </span>
          </h1>
        </b-tooltip>
      </div>
    </template>

    <template v-slot:default>
      <div class="card-content-wrapper">
        <slot name="default" />
      </div>
    </template>

    <template v-slot:footer v-if="remove || edit || duplicate">
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
          <b-tooltip
            v-if="remove"
            :label="`Delete ${itemType}`"
            type="is-danger"
            position="is-bottom"
          >
            <b-button
              @click="$emit('remove', item.id)"
              type="is-danger"
              icon-left="trash-alt"
            />
          </b-tooltip>
          <b-tooltip
            v-if="edit"
            :label="`Edit ${itemType}`"
            position="is-bottom"
          >
            <b-button @click="$emit('edit', item.id)" icon-left="pencil-alt" />
          </b-tooltip>
          <b-tooltip
            v-if="duplicate"
            :label="`Duplicate ${itemType}`"
            position="is-bottom"
          >
            <b-button @click="$emit('duplicate', item.id)" icon-left="clone" />
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
      default: "",
    },
    value: Object,
    link: Boolean,
    save: Boolean,
    remove: Boolean,
    edit: Boolean,
    duplicate: Boolean,
    // **** GenericCard Props ****
    selectable: Boolean,
  },
  data() {
    return {
      showTooltip: false,
    };
  },
  mounted() {
    const { height } = this.$refs.title.getBoundingClientRect();
    this.$refs.title.style.whiteSpace = "nowrap";

    const { height: newHeight } = this.$refs.title.getBoundingClientRect();
    this.$nextTick(() => {
      this.showTooltip = newHeight < height;
    });
  },
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
