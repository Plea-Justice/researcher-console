<template>
  <div>
    <nav
      class="navbar header has-shadow is-dark"
      role="navigation"
      aria-label="main navigation"
    >
      <div class="navbar-brand">
        <n-link class="navbar-item" to="/">
          Plea Simulation Researcher Console
        </n-link>

        <div class="navbar-burger">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div class="navbar-menu">
        <div class="navbar-start">
          <div class="navbar-item">
            <UploadButton />
          </div>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            
          </div>
          <div class="navbar-item">
            <button class="button is-primary">
              <b-icon size="is-small" icon="folder-download" />
              <span>Download Package</span>
            </button>
          </div>
          <div class="navbar-item">
            <button class="button is-danger">
              <b-icon size="is-small" icon="exit-run" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

    </nav>

  <!--
    <section class="main-content columns">
      <aside class="column is-2 section">
        <p class="menu-label is-hidden-touch">General</p>
        <ul class="menu-list">
          <li v-for="(item, key) of items" :key="key">
            <nuxt-link :to="item.to" exact-active-class="is-active">
              <b-icon :icon="item.icon" />
              {{ item.title }}
            </nuxt-link>
          </li>
        </ul>
      </aside>
      -->

      <div class="container column is-10">
        <nuxt />
      </div>
    </section>
  </div>
</template>

<script>
import UploadButton from '~/components/UploadButton'
export default {
  components: {
    UploadButton
  },
  data() {
    return {
      items: [
        {
          title: "Home",
          icon: "home",
          to: { name: "index" }
        },
        {
          title: "Inspire",
          icon: "lightbulb",
          to: { name: "inspire" }
        }
      ]
    };
  }
};
</script>
