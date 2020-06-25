<template>
  <b-navbar type="is-dark">
    <template slot="brand">
      <b-navbar-item :tag="path ? 'n-link' : 'div'" :to="path || null">
        <h1 class="subtitle has-text-light">{{ title }}</h1>
      </b-navbar-item>
    </template>

    <template slot="start">
      <b-navbar-item tag="div">
        <div class="buttons">
          <slot name="start" />
        </div>
      </b-navbar-item>
      <template v-for="item in items">
        <b-navbar-item
          v-if="item.name != 'index'"
          :key="item.path"
          :to="item.path"
          class="is-capitalized"
        >{{item.name}}</b-navbar-item>
      </template>
    </template>

    <template slot="end">
      <b-navbar-item tag="div">
        <div class="buttons">
          <slot name="end" />
          <!-- Logout Button -->
          <b-button @click="logout()" type="is-danger" icon-left="exit-run">Log Out, {{ userName }}</b-button>

          <!-- Help Menu -->
          <HelpSidebar :helpInfo="helpInfo" />
        </div>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script>
import HelpSidebar from "~/components/HelpSidebar";

export default {
  name: "NavBar",
  components: { HelpSidebar },
  // FIXME: use site title as title fallback
  props: {
    title: {
      type: String,
      required: false,
      default: "PleaBargain"
    },
    path: {
      type: String,
      required: false,
      default: ""
    },
    help: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  created() {
    this.$router.options.routes.forEach(route => {
      this.items.push({
        name: route.name,
        path: route.path
      });
    });
  },
  data() {
    return {
      items: []
    };
  },
  computed: {
    userName() {
      return this.$auth.user || "Testing";
    }
  }
};
</script>
