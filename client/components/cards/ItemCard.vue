<template>
  <GenericCard
    @remove="$emit('remove', item.id)"
    @selected="$emit('selected', item.id)"
    :close="close"
    :selection="selection"
  >
    <template v-slot:header>
      <template v-if="item">
        <!-- If header's not in form mode print name w or w/o link -->
        <n-link v-if="link" :to="item.id" append>
          <h1 class="subtitle">{{ item.name }}</h1>
        </n-link>

        <h1 v-else class="subtitle">{{ item.name }}</h1>
      </template>

      <!-- In form mode v-model item name as input -->
      <b-input
        v-else
        ref="focus_target"
        v-model="value.name"
        placeholder="title"
        class="flex-grow"
      />
    </template>

    <template v-slot:default>
      <slot name="default" />
    </template>

    <template v-if="save" v-slot:footer>
      <b-button
        class="is-fullwidth clear-button-margin"
        type="is-primary"
        tag="input"
        native-type="submit"
        value="Save"
      />
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
    selection: {
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
