<template>
  <div>
    <b-sidebar type="is-dark" :open.sync="open" fullheight right>
      <div class="column has-text-light has-text-left">
        <div class="has-text-right">
          <b-button
            @click="toggleMenu()"
            type="is-dark"
            icon-left="close"
            size="medium"
          />
        </div>

        <h3 class="title has-text-light">{{ title }}</h3>
        <p>{{ text }}</p>
      </div>
    </b-sidebar>

    <b-button
      @click="toggleMenu()"
      :type="buttonType"
      icon-left="help-circle"
    />
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
      default: "is-dark",
      required: false
    }
  },
  data() {
    return {
      open: false
    };
  },
  methods: {
    toggleMenu() {
      this.open = !this.open;
    }
  }
};
</script>
