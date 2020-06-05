<template>
  <!-- FIXME: clean this up -->
  <div class="flex-wrapper">
    <section class="hero-wrapper">
      <div class="hero full-height is-primary is-bold">
        <div class="hero-body">
          <div class="container full-height">
            <nuxt />
          </div>
        </div>
      </div>
    </section>
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
