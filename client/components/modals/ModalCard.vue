<template>
  <b-modal
    v-model="innerValue"
    has-modal-card
    trap-focus
    :aria-role="ariaRole"
    aria-modal
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div class="modal-card" :class="{ 'is-dark': isDark }">
      <header v-if="!emptyHeader" class="modal-card-head">
        <h3 v-if="title" class="modal-card-title">{{ title }}</h3>
        <slot name="header" />
      </header>
      <section class="modal-card-body">
        <slot name="default" />
      </section>
      <footer v-if="!emptyFooter" class="modal-card-footer">
        <slot name="footer" />
      </footer>
    </div>
  </b-modal>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    title: String,
    isDark: Boolean,
    ariaRole: {
      type: String,
      default: "dialog",
    },
  },
  computed: {
    innerValue: {
      get() {
        return this.value;
      },
      set(newValue) {
        this.value = newValue;
      },
    },
    emptyHeader() {
      return !this.$slots.header?.[0] && !this.title;
    },
    emptyFooter() {
      return !this.$slots.footer?.[0];
    },
  },
};
</script>

<style scoped lang="scss">
.modal-card:not(.is-dark) {
  color: $text;
}

.modal-card.is-dark {
  color: $white-ter;

  & > .modal-card-head,
  .modal-card-foot {
    color: $white-ter;
    background-color: $dark;
  }

  & > .modal-card-head {
    border-bottom-color: $black-ter;

    .modal-card-title {
      color: $white-bis;
    }
  }

  & > .modal-card-body {
    background-color: $grey-dark;
  }
}
</style>
