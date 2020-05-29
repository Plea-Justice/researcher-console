<template>
  <section>
    <b-sidebar type="is-dark" :fullheight="true" :right="true" :open.sync="open">
      <div class="column has-text-light has-text-left">
        <div class="has-text-right" v-on:click="help">
          <b-icon class="is-medium" icon="help-circle" />
        </div>
        <span class="title has-text-light">Help</span><br /><br />
        <div>{{ helpinfo }}</div>
      </div>
    </b-sidebar>

    <div v-on:click="help">
      <b-icon size="is-small" icon="help-circle" />
    </div>

  </section>
</template>

<script>
export default {
  props: {
    helpinfo: String
  },
  data() {
    return {
      open: false
    };
  },
  methods: {
    help() {
      this.open = !this.open;
    }
  }
};
</script>