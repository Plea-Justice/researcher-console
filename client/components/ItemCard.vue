<template>
  <div class="card has-radius-large">
    <!-- Wrapper for highlighting a card -->
    <div v-if="selection" @click="$emit('click', id)" class="selection-wrapper has-radius-large" />

    <!-- Card Header -->
    <!-- when collapsed style header as body -->
    <header v-if="!blank" class="flex-header" :class="headerModeStyle">
      <!-- When collapsed show remove button in header -->
      <b-button v-if="collapsed" @click="$emit('remove', id)" type="is-danger" icon-left="close" />

      <template v-if="item">
        <!-- If header's not in form mode print name w or w/o link -->
        <n-link v-if="link" :to="id" append>
          <h1 class="subtitle">{{ item.name }}</h1>
        </n-link>

        <h1 v-else class="subtitle">{{ item.name }}</h1>
      </template>

      <!-- In form mode v-model item name as input -->
      <b-input
        v-else
        ref="form-card-input"
        v-model="value.name"
        placeholder="title"
        class="flex-grow"
      />
    </header>

    <!-- Card Body -->
    <div v-if="!collapsed" :class="{ 'flex-center': blank }" class="card-content flex-grow">
      <b-button v-if="blank" type="is-light" size="is-medium" icon-left="plus" />
      <slot v-else name="default" />
    </div>

    <!-- Card Footer -->
    <footer v-if="(close || save) && !collapsed" class="card-footer">
      <div class="card-footer-item buttons footer-buttons flex-left">
        <!-- Check if remove listener exists instead of using remove -->
        <b-button v-if="close" @click="$emit('remove', id)" type="is-danger" icon-left="close" />
        <b-button
          v-if="save"
          class="is-fullwidth clear-button-margin"
          type="is-primary"
          tag="input"
          native-type="submit"
          value="Save"
        />
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
    // Item's properties (used for name)
    item: {
      type: Object,
      required: false
    },
    id: {
      type: String,
      required: false
    },
    // Sets if component should append id to route (for dynamic paging)
    link: {
      type: Boolean,
      required: false,
      default: false
    },
    // Sets if component should display form submit button
    save: {
      type: Boolean,
      required: false,
      default: false
    },
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
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    },
    blank: {
      type: Boolean,
      required: false,
      default: false
    },
    // v-model item's properties (used for name) in form mode
    value: {
      type: Object,
      required: false
    }
  },
  computed: {
    isForm() {
      return !!this.value;
    },
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
