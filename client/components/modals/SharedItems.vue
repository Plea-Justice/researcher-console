<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p v-if="name" class="modal-card-title is-capitalized">{{ name }}</p>
      <slot v-else name="header" />
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
    name: String,
  },
};
</script>

<style scoped>
.modal-card {
  width: 90vw;
}

.item-grid {
  padding: 1rem 2rem;
}
</style>
