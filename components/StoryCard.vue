<template>
  <!-- /* TODO: Use calculated value, based on max number of conditions visible defined by a media query */ -->

  <div
    :class="{ 'card-collapsed': isCollapsed }"
    class="tile is-child card has-radius-large"
  >
    <!-- Card Header -->
    <header
      v-show="!isBlank"
      :class="{ 'card-header-collapsed': isCollapsed }"
      class="card-header has-top-radius-large"
    >
      <span class="card-header-icon">
        <b-button
          @click="collapse()"
          :icon-left="`chevron-${isCollapsed ? 'down' : 'up'}`"
          size="is-medium"
        />
      </span>
      <slot name="header" />
    </header>

    <!-- Card Body -->
    <div v-show="!isCollapsed" class="card-content full-height">
      <slot />
    </div>

    <!-- Card Footer -->
    <footer v-show="!isCollapsed" class="card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script>
import FileSelector from "~/components/FileSelector";
import ButtonInput from "~/components/ButtonInput";

export default {
  name: "StoryCard",
  components: { FileSelector, ButtonInput },
  props: {
    frameCollapsed: {
      type: Boolean,
      required: true
    },
    isBlank: {
      type: Boolean,
      required: false
    }
  },
  data() {
    const selfCollapsed = false;

    return {
      selfCollapsed
    };
  },
  computed: {
    isCollapsed() {
      return this.frameCollapsed || this.selfCollapsed;
    }
  },
  methods: {
    collapse() {
      if (!this.frameCollapsed) this.selfCollapsed = !this.selfCollapsed;
    },
    async getAsset(assetName) {
      console.log(assetName);
      const { name, ...b } = assetName;
      console.log("a: " + name);
      console.log("b: " + b);

      const asset =
        assetName != "None"
          ? await this.$axios.$get(`/assets/${assetName}`)
          : "Error: asset is 'None' or missing asset field exists";
      return asset;
    }
  }
};
</script>

<style scoped>
/* Fix for card footer */
.tile.is-child.card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* FIXME: use Bulma SASS $radius-large variable */
.has-radius-large {
  border-radius: 6px;
}

.card-collapsed {
  box-shadow: none;
  -webkit-box-shadow: none;
}

/* FIXME: reference .has-radius-large class */
.card-header-collapsed {
  border-radius: 6px; /* Should follow .has-radius-large class */
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  -webkit-box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1),
    0 0 0 1px rgba(10, 10, 10, 0.1);
}

.full-height {
  height: 100%;
}
</style>
