<template>
  <div class="modal-card" style="width: 50vw">
    <header class="modal-card-head">
      <p class="modal-card-title">Live Simulation Link</p>
    </header>
    <section class="modal-card-body">
      <p>Participants may access your simulation through these links:</p>
      <p class="mt-4 has-text-centered">
        <b>Avatar Customization then Simulation</b><br/>
        <code>
          <a
            id="link1"
            class="p-2 is-size-7"
            style="outline: grey dashed 1px"
            :href="url + 'avatar.html'"
            >{{ url + 'avatar.html' }}</a
          >
          <b-button
            id="copy"
            class="ml-1"
            data-clipboard-target="#link1"
            size="is-small"
            type="is-primary"
            icon-left="clipboard"
            >Copy</b-button
          >
        </code><br/><br/>
        <b>Direct to Simulation</b><br/>
        <code>
          <a
            id="link2"
            class="p-2 is-size-7"
            style="outline: grey dashed 1px"
            :href="url + 'simulation.html' "
            >{{ url + 'simulation.html' }}</a
          >
          <b-button
            id="copy"
            class="ml-1"
            data-clipboard-target="#link2"
            size="is-small"
            type="is-primary"
            icon-left="clipboard"
            >Copy</b-button
          >
        </code>
      </p>
      <p class="mt-4">
        Copy one of these links to a custom end block in your Qualtrics survey
        to send participants to the simulation. Pass the required parameters
        into the simulation from Qualtrics as described
        <a href="https://pleajustice.org/simulation/working-with-qualtrics"
          >here</a
        >.
      </p>
      <p class="mt-3">
        This link will only work if given the required parameters; you cannot
        open it directly. Parameters must be added to the end of the URL
        manually or using Qualtrics embedded data fields. At the least, you
        should pass the condition number. Also pass any other variables you
        reference with piped text such as the participant's name.
      </p>
      <p class="mt-3">
         For example, if you reference the participant's first name in your
         script as <code>@Name;</code>, your survey end block must pass the name
         to the simulation in it's URL as
         <u>https://my.link/simulation.html<b>?condition=${e://Field/condition}&Name=${e://Field/Name}</b></u>.
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
