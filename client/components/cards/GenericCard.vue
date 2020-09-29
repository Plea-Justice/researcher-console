<template>
  <div :class="{ invalid: invalid }" class="card">
    <!-- Absolute item for highlighting a card -->
    <div
      v-if="selectable"
      @click="$emit('selected')"
      :style="{ '--invalid': invalid ? 1 : 0 }"
      class="selection-mask"
    />

    <!-- Card Header -->
    <!-- when collapsed style header as body -->
    <header
      v-if="!emptyHeader"
      class="card-header flex-header"
      :class="headerModeStyle"
    >
      <slot name="header" />
    </header>

    <!-- Card Body -->
    <div v-show="!collapsed" class="card-content">
      <slot name="default" />
    </div>

    <!-- Card Footer -->
    <footer v-if="!emptyFooter && !collapsed" class="card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script>
// Import VueX
import { mapActions } from "vuex";

export default {
  name: "GenericCard",
  props: {
    // Sets if component is selectable
    selectable: Boolean,
    invalid: Boolean,
    // Sets if component is in a collapsed state (only header, with flex styling properties)
    collapsed: Boolean
  },
  created() {
    this.$nextTick(() => this.setShowSlots());
  },
  beforeUpdate() {
    this.$nextTick(() => this.setShowSlots());
  },
  data() {
    return {
      emptyHeader: false,
      emptyFooter: false
    };
  },
  computed: {
    headerModeStyle() {
      // When collapsed style header as body
      return this.collapsed ? "card-content" : "card-header";
    }
  },
  methods: {
    setShowSlots() {
      this.emptyHeader = !this.$slots.header?.[0];
      this.emptyFooter = !this.$slots.footer?.[0];
    }
  }
};
</script>

<style lang="scss" scoped>
$borderWidth: 1px;

.invalid {
  border: $borderWidth solid $selectedRedDark;
}

.selection-mask {
  @include selectionMask();
  border-radius: calc(#{$radius-large} - var(--invalid) * #{$borderWidth});
}

.card {
  height: 100%;

  // Fix for card footer when using tiles
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  // Make card full-height
  flex-grow: 1;
  // for selection mask
  position: relative;

  border-radius: $radius-large;
}

// Even out all padding between header, body, and footer
.card-header {
  padding: $cardHeadFootPadding 1.5rem;
}

.card-content {
  flex-grow: 1;
}

.card-footer {
  padding: $cardHeadFootPadding;
}

.card-footer-item {
  padding: 0 $cardHeadFootPadding 0;
}

.card-footer-item:empty {
  display: none;
}

.flex-header {
  display: flex;
  flex-direction: row;
  align-items: center;

  // Everything except last child & > :not(:last-child)
  & > :nth-last-child(n + 2) {
    margin-right: $cardHeadFootPadding;
  }
}

.footer-buttons {
  justify-content: flex-start !important;
  margin-bottom: 0;
  padding-bottom: 0;
  border: none;

  & > .button {
    margin-bottom: 0;
  }
}
</style>
