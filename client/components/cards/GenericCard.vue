<template>
  <!-- FIXME: remove id from events -->

  <div class="card has-radius-large">
    <!-- Wrapper for highlighting a card -->
    <div v-if="selection" @click="$emit('selected')" class="selection-wrapper has-radius-large" />

    <!-- Card Header -->
    <!-- when collapsed style header as body -->
    <header v-if="!focused" class="card-header flex-header" :class="headerModeStyle">
      <b-button v-if="collapsed" @click="$emit('remove')" type="is-danger" icon-left="close" />
      <slot name="header" />
      <!-- When collapsed show remove button in header -->
    </header>

    <!-- Card Body -->
    <div v-if="!collapsed" :class="{ 'flex-center': focused }" class="card-content flex-grow">
      <slot name="default" />
    </div>

    <!-- Card Footer -->
    <footer v-if="(!collapsed && !focused)" class="card-footer">
      <div class="card-footer-item buttons footer-buttons flex-left">
        <!-- Check if remove listener exists instead of using remove -->
        <b-button v-if="close" @click="$emit('remove')" type="is-danger" icon-left="close" />
        <slot name="footer" />
      </div>
    </footer>
  </div>
</template>

<script>
// Import VueX
import { mapActions } from "vuex";

export default {
  name: "ItemCard",
  props: {
    // Sets if component should display form submit button
    close: {
      type: Boolean,
      required: false,
      default: false
    },
    // Sets if component is in selection mode
    selection: {
      type: Boolean,
      required: false,
      default: false
    },
    // Sets wether to only show body
    focused: {
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
      return this.collapsed ? "card-content flex-grow" : "card-header";
    }
  }
};
</script>

<style lang="scss" scoped>
.selection-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  cursor: pointer;

  &:hover {
    background-color: #007aff50;
  }

  &:active {
    background-color: #0a84ff64;
  }
}

.card {
  // Fix for card footer when using tiles
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  // Make card full-height
  flex-grow: 1;
  // for selection wrapper
  position: relative;
}

// Even out all padding between header, body, and footer
.card-header {
  padding: 0.75rem 1.5rem;
}

.card-footer {
  padding: 0.75rem;
}

.card-footer-item {
  padding: 0 0.75rem 0;
}

// FIXME: use Bulma SASS $radius-large variable
.has-radius-large {
  border-radius: 6px;
}

// FIXME: Combine this with flex-center for less redundant styling
.flex-header {
  display: flex;
  justify-content: center;
  align-items: center;

  // Everything except last child & > :not(:last-child)
  & > :nth-last-child(n + 2) {
    margin-right: 0.75rem;
  }
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.flex-grow {
  flex-grow: 1;
}

.footer-buttons {
  border: none;
  padding-bottom: 0;
  margin-bottom: 0;

  & > .button {
    margin-bottom: 0;
  }
}

.flex-left {
  justify-content: flex-start !important;
}
</style>
