<template>
  <!-- FIXME: clean this up -->

  <div class="hero is-primary is-bold is-fullheight">
    <div class="hero-body">
      <div class="container">
        <nuxt />
      </div>
    </div>
  </div>
</template>

<style scoped>
.flex-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.hero-wrapper {
  flex-grow: 1;
}

.full-height {
  height: 100%;
}
</style>
