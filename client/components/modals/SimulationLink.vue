<template>
  <div class="modal-card" style="width: 50vw">
    <header class="modal-card-head">
      <p class="modal-card-title">Live Simulation Link</p>
    </header>
    <section class="modal-card-body">
      <p>Participants may access your simulation through this link:</p>
      <p class="mt-6 has-text-centered">
        <code>
          <a
            id="link"
            class="p-2"
            style="outline: grey dashed 1px"
            :href="url"
            >{{ url }}</a
          >
          <b-button
            id="copy"
            class="ml-1"
            data-clipboard-target="#link"
            size="is-small"
            type="is-primary"
            icon-left="clipboard"
            >Copy</b-button
          >
        </code>
      </p>
      <p class="mt-6">
        Copy this link to a custom end block in your Qualtrics survey to have
        participants sent to the simulation. Linking to the simulation and
        passing in variables through the URL query string is covered
        <a href="https://pleajustice.org/simulation/working-with-qualtrics"
          >here</a
        >.
      </p>
      <p class="mt-3">
        Clicking directly on this link will not work, the required parameters
        must be added to the end of the URL either manually or through Qualtrics
        embedded data fields.
      </p>
    </section>
    <footer class="modal-card-foot is-justify-content-flex-end">
      <b-button class="is-fullwidth" type="is-primary" @click="closeModal()">Done</b-button>
    </footer>
  </div>
</template>

<script>
// Import VueX
import { mapActions } from "vuex";

// Import clipboard
import ClipboardJS from "clipboard";

export default {
  name: "SimulationLink",
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  mounted() {
    const clipboard = new ClipboardJS("#copy");
    clipboard.on("success", () =>
      this.$buefy.toast.open({
        message: "Link copied!",
        type: "is-success"
      })
    );
  },
  methods: {
    closeModal() {
      this.$parent.close();
    },
  },
};
</script>
