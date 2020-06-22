<template>
  <div>
    <b-navbar type="is-dark">
      <template slot="brand">
        <b-navbar-item tag="div">
          <n-link class="navbar-item" to="/">
            <h1 class="has-text-light">{{ scenarioName }}</h1>
          </n-link>
        </b-navbar-item>
      </template>

      <template slot="start">
        <b-navbar-item tag="div">
          <div class="buttons">
            <!-- Upload Button -->
            <b-button @click="uploadModal()" type="is-primary" icon-left="file-upload">Upload Asset</b-button>

            <!-- Download Button -->
            <b-button
              @click="downloadZip()"
              type="is-primary"
              icon-left="folder-download"
            >Download Package</b-button>
          </div>
        </b-navbar-item>
      </template>

      <template slot="end">
        <b-navbar-item tag="div">
          <div class="buttons">
            <!-- Logout Button -->
            <b-button
              @click="logout()"
              type="is-danger"
              icon-left="exit-run"
            >Log Out, {{ userName }}</b-button>

            <!-- Help Menu -->
            <HelpSidebar :helpInfo="helpInfo" />
          </div>
        </b-navbar-item>
      </template>
    </b-navbar>

    <nuxt />
  </div>
</template>

<script>
// Import Components
import UploadModal from "~/components/UploadModal";
import HelpSidebar from "~/components/HelpSidebar";

export default {
  components: {
    UploadModal,
    HelpSidebar
  },
  data() {
    return {
      // FIXME: Name should come from manifest or user directory.
      scenarioName: "Grant Study, Hit and Run",
      helpInfo:
        "Variable for information about the storyboard page would appear here with links to the wiki. Click the study name to return to the scenario selection screen."
    };
  },
  computed: {
    userName() {
      return this.$auth.user ? this.$auth.user.name : "Testing";
    }
  },
  methods: {
    async logout() {
      await this.$auth.logout();
      this.$router.push("/");
    },
    uploadModal() {
      this.$buefy.modal.open({
        parent: this,
        component: UploadModal,
        hasModalCard: true,
        trapFocus: true
      });
    },
    downloadZip() {
      this.$buefy.toast.open({
        message: "Zip download will begin momentarily.",
        type: "is-success"
      });
    }
  }
};
</script>
