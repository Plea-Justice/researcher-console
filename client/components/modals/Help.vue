<template>
  <div>
    <ModalCard v-model="open" :title="title" @close="toggleMenu()" isDark>
      <div class="content" style="font-size: 0.95rem" v-html="text" />
    </ModalCard>

    <b-button @click="toggleMenu()" :type="buttonType" icon-left="question" />
  </div>
</template>

<script>
// Import Components
import ModalCard from "~/components/modals/ModalCard";

export default {
  components: { ModalCard },
  props: {
    text: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "Help",
    },
    buttonType: {
      type: String,
      default: "is-dark",
    },
  },
  data() {
    return {
      open: false,
    };
  },
  methods: {
    toggleMenu() {
      this.open = !this.open;
    },
  },
};
</script>
