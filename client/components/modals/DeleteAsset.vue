<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Delete: {{ name }}</p>
    </header>
    <section class="modal-card-body is-flex">
      <div class="media">
        <div class="media-left">
          <b-icon icon="exclamation-circle" type="is-danger" size="is-large" />
        </div>
        <div class="media-content">
          <div v-if="references && references.length" class="content">
            <p>"{{ name }}" is used in the following scenarios:</p>
            <ul>
              <li v-for="ref in references" :key="ref.id">{{ ref.name }}</li>
            </ul>
          </div>

          <p>
            Deleted assets are not recoverable.
            Are you sure you want to delete this asset?
          </p>
        </div>
      </div>
    </section>
    <footer class="modal-card-foot">
      <b-button @click="closeModal()">Cancel</b-button>
      <b-button @click="confirmHelper()" type="is-danger">Delete</b-button>
    </footer>
  </div>
</template>

<script>
// Import VueX
import { mapActions } from "vuex";

export default {
  name: "LeaveScenario",
  props: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    onConfirm: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      references: null
    };
  },
  mounted() {
    this.$axios.$get(`/api/v1/assets/${this.id}/references`).then(response => {
      if (response.success) this.references = response.result;
    });
  },
  methods: {
    closeModal() {
      this.$parent.close();
    },
    ...mapActions({
      removeAsset: "assets/removeAsset"
    }),
    confirmHelper() {
      this.onConfirm();
      this.closeModal();
    }
  }
};
</script>

<style scoped>
.media-left {
  height: 100%;
  display: flex;
  align-items: center;
}
</style>
