<template>
  <div>
    <NavBar :title="scenarioName" path="/scenarios" help>
      <template v-slot:start></template>
    </NavBar>

    <nuxt />
  </div>
</template>

<script>
// Import Components
import NavBar from "~/components/NavBar";

export default {
  components: { NavBar },
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
