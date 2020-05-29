<template>
  <div>
    <nav
      class="navbar header has-shadow is-fixed-top is-dark"
      role="navigation"
      aria-label="main navigation"
    >
      <div class="navbar-brand">
        <n-link class="navbar-item" to="/">
          {{ scenario_name }}
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
          <div class="navbar-item" >
            <HelpSidebar v-bind:helpinfo="helpinfo" />
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
import HelpSidebar from "~/components/HelpSidebar";
export default {
  components: {
    UploadButton,
    DownloadButton,
    HelpSidebar
  },
  data() {
    return {
      // FIXME: Name should come from manifest or user directory.
      scenario_name: "Grant Study, Hit and Run",
      helpinfo: "Variable for information about the storyboard page would appear here with links to the wiki. Click the study name to return to the scenario selection screen."
    }
  },
  methods:{
    async logout() {
      await this.$auth.logout();
      this.$router.push("/");
    }
  }
};
</script>
