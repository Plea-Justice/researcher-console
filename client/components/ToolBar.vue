<template>
  <!-- Level Toolbar -->
  <div class="level padded-responsive-container toolbar">
    <!-- Left Side Toolbar -->
    <div class="level-left">
      <slot name="start" />
    </div>

    <slot name="default" />

    <!-- Right Side Toolbar -->
    <div class="level-right">
      <slot name="end" />
    </div>
  </div>
</template>

<script>
export default {
  name: "ToolBar"
};
</script>

<style lang="scss" scoped>
.toolbar {
  @include sticky();
  z-index: $buefyOverlapIndex + 2;
  top: 0;

  height: 4rem;
  margin-bottom: 0;
  background-color: $light;
}
</style>
