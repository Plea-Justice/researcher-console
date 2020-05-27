<template>
  <div>
    <nav
      class="navbar header has-shadow is-fixed-top is-dark"
      role="navigation"
      aria-label="main navigation"
    >
      <div class="navbar-brand">
        <n-link class="navbar-item" to="/">
          <!-- FIXME: use an environment variable -->
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
            <DownloadButton />
          </div>
          <div class="navbar-item">
            <p class="is-large">{{ Username Here <!-- this.$auth.user.name -->}}</p>
          </div>
          <div class="navbar-item">
            <button class="button is-danger" v-on:click="logout">
              <b-icon size="is-small" icon="exit-run" />
              <span>Log Out</span>
            </button>
          </div>
          <div class="navbar-item">
            <b-icon size="is-small" icon="help-circle" />
          </div>
        </div>
      </div>
    </nav>

    <section>
      <div class="container column is-10">
        <nuxt />
      </div>
    </section>
  </div>
</template>

<script>
import UploadButton from "~/components/UploadButton";
import DownloadButton from "~/components/DownloadButton";
export default {
  components: {
    UploadButton,
    DownloadButton
  },
  methods:{
    async logout() {
      await this.$auth.logout();
    }
  }
};
</script>
