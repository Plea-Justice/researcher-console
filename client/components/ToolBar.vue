<template>
  <!-- Level Toolbar -->
  <nav class="level padded-responsive-container sticky toolbar">
    <!-- Left Side Toolbar -->
    <div class="level-left">
      <slot name="start" />
    </div>

    <!-- Right Side Toolbar -->
    <div class="level-right">
      <slot name="end" />
    </div>
  </nav>
</template>

<script>
export default {};
</script>

<style scoped>
.toolbar {
  margin-bottom: 0;
  /* Sticky below toolbar */
  top: 0;
  height: 5rem;
  background-color: whitesmoke;
}
</style>
