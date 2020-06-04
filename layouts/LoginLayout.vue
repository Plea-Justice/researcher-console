<template>
  <!-- FIXME: clean this up -->
  <div class="flex-wrapper">
    <section class="hero-wrapper">
      <div class="hero hero-extend-height is-primary is-bold">
        <div class="hero-body">
          <div class="container">
            <h1 class="title has-text-centered">
              <!-- FIXME: use an environment variable -->
              Plea Simulation Researcher Console
            </h1>
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

.hero-extend-height {
  height: 100%;
}
</style>
