<template>
  <section>
    <b-sidebar
      type="is-dark"
      :fullheight="true"
      :right="true"
      :open.sync="open"
    >
      <div class="column has-text-light has-text-left">
        <div class="has-text-right">
          <b-button
            @click="handleMenu()"
            type="is-dark"
            icon-left="help-circle"
            size="medium"
          />
        </div>

        <h3 class="title has-text-light">Help</h3>
        <p>{{ helpInfo }}</p>
      </div>
    </b-sidebar>

    <b-button @click="handleMenu()" type="is-dark" icon-left="help-circle" />
  </section>
</template>

<script>
export default {
  props: {
    helpInfo: String,
    required: false
  },
  data() {
    return {
      open: false
    };
  },
  methods: {
    handleMenu() {
      this.open = !this.open;
    }
  }
};
</script>
