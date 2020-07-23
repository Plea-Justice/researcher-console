<template>
  <b-navbar type="is-dark">
    <template slot="brand">
      <b-navbar-item :tag="path ? 'n-link' : 'div'" :to="path || null">
        <h1 class="subtitle has-text-light">
          {{ title || $siteConfig.title }}
        </h1>
      </b-navbar-item>
    </template>

    <template slot="start">
      <b-navbar-item tag="div">
        <div class="buttons">
          <slot name="start" />
        </div>
      </b-navbar-item>
      <template v-for="route in routes">
        <b-navbar-item
          v-if="route.name != 'index'"
          :key="route.path"
          tag="n-link"
          :to="route.path"
          class="is-capitalized"
          >{{ route.name }}</b-navbar-item
        >
      </template>
    </template>

    <template slot="end">
      <b-navbar-item tag="div">
        <div class="buttons">
          <slot name="end" />
          <!-- Logout Button -->
          <b-button @click="logout()" type="is-danger" icon-left="exit-run"
            >Log Out, {{ userName }}</b-button
          >

          <!-- Help Menu -->
          <HelpSidebar v-if="helpText" :title="helpTitle" :text="helpText" />
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
      default: ""
    },
    path: {
      type: String,
      required: false,
      default: ""
    },
    helpText: {
      type: String,
      required: false,
      default: false
    },
    helpTitle: {
      type: String,
      required: false
    }
  },
  data() {
    return {
      routes: [
        {
          name: "assets",
          path: "/assets"
        },
        {
          name: "scenarios",
          path: "/scenarios"
        }
      ]
    };
  },
  computed: {
    userName() {
      return this.$auth.user ? this.$auth.user.name : "Dev";
    }
  },
  methods: {
    async logout() {
      await this.$auth.logout().then(() => this.$router.push("/"));
    }
  }
};
</script>
