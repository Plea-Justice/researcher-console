<template>
  <!-- /* TODO: Use calculated value, based on max number of conditions visible defined by a media query */ -->
  <!-- Non Blank Scene -->
  <div v-if="!isBlank" class="card has-radius-large">
    <!-- Card Header -->
    <header class="card-header has-top-radius-large">
      <slot name="header" />
    </header>

    <!-- Card Body -->
    <div v-show="!frameCollapsed" class="card-content flex-grow">
      <slot />
    </div>

    <!-- Card Footer -->
    <footer v-show="!frameCollapsed" class="card-footer">
      <div class="card-footer-item buttons footer-buttons flex-left">
        <b-button @click="removeScene(sceneIndex)" type="is-danger" icon-right="close" />
        <slot name="footer" />
      </div>

      <!-- Move Up/Down Buttons -->
      <div class="card-footer-item buttons flex-right">
        <b-button
          v-if="!isFirst"
          @click="moveSceneUp(sceneIndex)"
          type="is-text"
          size="is-large"
          icon-right="chevron-up"
          class="move-button"
        />
        <b-button
          v-if="!isLast"
          @click="moveSceneDown(sceneIndex)"
          type="is-text"
          size="is-large"
          icon-right="chevron-down"
          class="move-button"
        />
      </div>
    </footer>
  </div>

  <!-- Blank Scene -->
  <div v-else class="card has-radius-large">
    <div v-if="isFirst" class="center-wrapper">
      <b-button type="is-light" icon-left="plus" size="is-large" />
    </div>
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
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
    sceneIndex: {
      type: Object,
      required: false
    }
  },
  computed: {
    ...mapGetters({
      isMoveableScene: "scenes/isMoveableScene",
      getisFirst: "scenes/isFirst",
      getisLast: "scenes/isLast",
      getisBlank: "scenes/isBlank"
    }),
    isFirst() {
      return this.getisFirst(this.sceneIndex);
    },
    isLast() {
      return this.getisLast(this.sceneIndex);
    },
    isBlank() {
      return this.getisBlank(this.sceneIndex);
    }
  },
  methods: {
    ...mapActions({
      moveSceneUp: "scenes/moveSceneUp",
      moveSceneDown: "scenes/moveSceneDown",
      removeScene: "scenes/removeScene"
    })
  }
};
</script>

<style scoped>
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

.flex-grow {
  flex-grow: 1;
}

.move-button {
  font-size: unset;
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
</style>
