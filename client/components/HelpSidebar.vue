<template>
  <div>
    <b-sidebar type="is-dark" :fullheight="true" :right="true" :open.sync="open">
      <div class="column has-text-light has-text-left">
        <div class="has-text-right">
          <b-button @click="handleMenu()" type="is-dark" icon-left="help-circle" size="medium" />
        </div>

        <h3 class="title has-text-light">{{ title }}</h3>
        <p>{{ text }}</p>
      </div>
    </b-sidebar>

    <b-button @click="handleMenu()" :type="buttonType" icon-left="help-circle" />
  </div>
</template>

<script>
export default {
  name: "HelpSidebar",
  props: {
    text: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: "Help",
      required: false
    },
    buttonType: {
      type: String,
      default: "is-text",
      required: false
    }
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
