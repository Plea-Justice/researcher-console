<template>
  <div :class="{ invalid: invalid }" class="card">
    <!-- Wrapper for highlighting a card -->
    <div v-if="selectable" @click="$emit('selected')" class="selection-mask" />

    <!-- Card Header -->
    <!-- when collapsed style header as body -->
    <header v-if="!blank" class="card-header flex-header" :class="headerModeStyle">
      <!-- When collapsed show remove button in header -->
      <b-button
        v-if="collapsed && close"
        @click="$emit('remove')"
        type="is-danger"
        icon-left="times"
      />
      <slot name="header" />
    </header>

    <!-- Card Body -->
    <div v-show="!collapsed" :class="{ 'flex-center': blank }" class="card-content">
      <slot name="default" />
    </div>

    <!-- Card Footer -->
    <footer v-if="!collapsed && !blank" class="card-footer">
      <div class="card-footer-item buttons footer-buttons">
        <!-- TODO: Check if remove listener exists instead of using remove? -->
        <b-button v-if="close" @click="$emit('remove')" type="is-danger" icon-left="times" />
        <slot name="footer" />
      </div>
    </footer>
  </div>
</template>

<script>
// Import VueX
import { mapActions } from "vuex";

export default {
  name: "GenericCard",
  props: {
    close: {
      type: Boolean,
      required: false,
      default: false
    },
    // Sets if component is selectable
    selectable: {
      type: Boolean,
      required: false,
      default: false
    },
    // Sets wether to only show body
    blank: {
      type: Boolean,
      required: false,
      default: false
    },
    invalid: {
      type: Boolean,
      required: false,
      default: false
    },
    // Sets if component is in a collapsed state (only header, with flex styling properties)
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    headerModeStyle() {
      // When collapsed style header as body
      return this.collapsed ? "card-content" : "card-header";
    }
  }
};
</script>

<style lang="scss" scoped>
.invalid {
  border: 1px solid $selectedRedDark;
}

.selection-mask {
  @include selectionMask();
  border-radius: $radius-large;
}

.card {
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
  @include flexCenter();

  // Everything except last child & > :not(:last-child)
  & > :nth-last-child(n + 2) {
    margin-right: $cardHeadFootPadding;
  }
}

.flex-center {
  @include flexCenter();
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
