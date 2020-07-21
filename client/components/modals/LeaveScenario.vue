<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Leaving Scenario Edtior</p>
      <b-button
        @click="closeModal()"
        type="is-light"
        size="is-medium"
        icon-left="close"
      />
    </header>
    <section class="modal-card-body is-flex">
      <div class="media">
        <div class="media-left">
          <b-icon icon="alert-circle" type="is-danger" size="is-large" />
        </div>
        <div class="media-content">
          <p v-if="validationFailed">
            <span class="has-text-weight-bold">ERROR:</span> Saving failed,
            <u>invalid scenes exists</u> please return and fix them so your work
            can be saved!
          </p>
          <p v-else>If you have made any changes, save them before leaving.</p>
        </div>
      </div>
    </section>
    <footer class="modal-card-foot">
      <b-button v-if="validationFailed" @click="closeModal()" type="is-primary"
        >Return to Fix</b-button
      >
      <b-button v-else @click="saveHandler()" type="is-primary"
        >Save & Exit</b-button
      >
      <b-button @click="exitHandler()" type="is-danger">Force Exit </b-button>
    </footer>
  </div>
</template>

<script>
// Import VueX
import { mapActions } from "vuex";

export default {
  name: "LeaveScenario",
  props: {
    next: {
      type: Function,
      required: true
    },
    validate: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      validationFailed: false
    };
  },
  methods: {
    closeModal() {
      this.$parent.close();
    },
    saveHandler() {
      this.validate().then(success => {
        if (success) {
          this.saveScenario();
          this.exitHandler();
        } else {
          this.validationFailed = true;
        }
      });
    },
    exitHandler() {
      this.closeModal();
      this.next();
    },
    ...mapActions({
      saveScenario: "scenario/saveScenario"
    })
  }
};
</script>
