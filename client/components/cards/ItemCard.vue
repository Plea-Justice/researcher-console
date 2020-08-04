<template>
  <GenericCard
    @remove="$emit('remove', item.id)"
    @selected="$emit('selected', item.id)"
    :close="close"
    :selectable="selectable"
  >
    <template v-slot:header>
      <template v-if="item">
        <!-- If header's not in form mode print name w or w/o link -->
        <h1 class="subtitle">
          <n-link v-if="link" :to="item.id" class="link-animate" append>{{ item.name }}</n-link>
          <template v-else>{{ item.name }}</template>
        </h1>
      </template>

      <!-- In form mode v-model item name as input -->
      <b-input
        v-else
        ref="focus_target"
        v-model="value.name"
        placeholder="Name"
        class="flex-grow"
        required
      />
    </template>

    <template v-slot:default>
      <slot name="default" />
    </template>

    <template v-slot:footer>
      <b-button
        v-if="save"
        class="is-fullwidth clear-button-margin"
        type="is-primary"
        tag="input"
        native-type="submit"
        value="Save"
      />
      <b-button v-else @click="$emit('edit', item.id)" icon-left="pencil-alt" />
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
      required: false,
      default: false
    },
    selectable: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  methods: {
    focus() {
      this.$refs.focus_target.focus();
    }
  }
};
</script>

<style lang="scss" scoped>
.flex-grow {
  flex-grow: 1;
}
</style>
