<template>
  <!-- /* TODO: Use calculated value, based on max number of conditions visible defined by a media query */ -->
  <!-- Non Blank Scene -->
  <div v-if="!isBlank" class="card has-radius-large">
    <!-- Card Header -->
    <header :class="[frameCollapsed ? collapsedHeader : expandedHeader]">
      <div class="header-wrapper">
        <!-- Remove Scene -->
        <b-button @click="removeScene(id)" type="is-danger" icon-left="close" />
        <slot name="header" />
      </div>
    </header>

    <!-- Card Body -->
    <div v-show="!frameCollapsed" class="card-content flex-grow">
      <slot />
    </div>

    <!-- Card Footer -->
    <footer v-show="!frameCollapsed" class="card-footer">
      <div class="card-footer-item buttons footer-buttons flex-left">
        <slot name="footer-left" />
      </div>

      <!-- Move Up/Down Buttons -->
      <div class="card-footer-item buttons flex-right">
        <slot name="footer-right" />
      </div>
    </footer>
  </div>

  <!-- Blank Scene -->
  <div v-else class="card has-radius-large">
    <b-button
      @click="addScene(id)"
      class="center-button"
      type="is-light"
      icon-left="plus"
      size="is-large"
    />
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import FileSelector from "~/components/FileSelector";
import ButtonInput from "~/components/ButtonInput";

export default {
  name: "SceneCard",
  components: { FileSelector, ButtonInput },
  props: {
    frameCollapsed: {
      type: Boolean,
      required: true
    },
    id: {
      type: String,
      required: false
    }
  },
  data() {
    const expandedHeader = "card-header";
    const collapsedHeader = "card-content flex-grow";

    return { expandedHeader, collapsedHeader };
  },
  computed: {
    ...mapGetters({
      getIsBlank: "scenario/isBlank"
    }),
    // TODO: move isBlank logic directly to frame
    isBlank() {
      return this.getIsBlank(this.id);
    }
  },
  methods: {
    ...mapActions({
      moveSceneUp: "scenario/moveSceneUp",
      moveSceneDown: "scenario/moveSceneDown",
      addScene: "scenario/addScene",
      removeScene: "scenario/removeScene"
    })
  }
};
</script>

<style lang="scss" scoped>
.card {
  /* Card Size */
  width: 350px;
  /* Make card full-height */
  flex-grow: 1;
  /* Fix for card footer when using tiles */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* FIXME: use Bulma SASS $radius-large variable */
.has-radius-large {
  border-radius: 6px;
}

.header-wrapper {
  display: flex;
  justify-content: center;
  flex-grow: 1;
  padding: 0.75rem;

  /* everything except last child & > :not(:last-child) */
  & > :nth-last-child(n + 2) {
    margin-right: 0.75rem;
  }
}

.flex-grow {
  flex-grow: 1;
}

.footer-buttons {
  border: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

.flex-left {
  justify-content: flex-start !important;
}

.flex-right {
  justify-content: flex-end !important;
}

.center-button {
  align-self: center;
  margin-top: auto;
  margin-bottom: auto;
}
</style>
