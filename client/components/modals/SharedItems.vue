<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p v-if="name" class="modal-card-title is-capitalized">{{ name }}</p>
    </header>
    <section class="modal-card-body">
      <div class="item-grid">
        <slot name="default" />
      </div>
    </section>
  </div>
</template>

<script>
export default {
  props: {
    name: String
  }
};
</script>

<style>
/* FIXME: This will break things */
.animation-content {
  max-width: unset !important;
}
</style>

<style scoped>
.modal-card {
  width: 90vw;
}

.modal-card-body {
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

.item-grid {
  padding: 1rem 2rem;
}
</style>
