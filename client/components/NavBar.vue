<template>
  <b-navbar type="is-dark" class="navbar">
    <template slot="brand">
      <b-navbar-item :tag="path ? 'n-link' : 'div'" :to="path || null">
        <h1 class="subtitle has-text-light">
          {{ title || $siteConfig.title }}
        </h1>
      </b-navbar-item>
    </template>

    <template slot="start">
      <b-navbar-item tag="div" class="buttons hide-if-empty">
        <slot name="start" />
      </b-navbar-item>
      <template v-for="route in routes">
        <b-navbar-item
          v-if="route.name !== 'index'"
          :key="route.path"
          :active="route.path === $nuxt.$route.path"
          :to="route.path"
          tag="n-link"
          class="is-capitalized"
        >
          {{ route.name }}
        </b-navbar-item>
      </template>
      <b-navbar-item tag="div" v-if="env.MODE === 'development'">
        <b-button
          type="is-info is-light is-static"
          :label="`Dev Mode: ${env.BRANCH}`"
        />
      </b-navbar-item>
    </template>

    <template slot="end">
      <b-navbar-item v-if="user.sessions > 1" tag="div">
        <b-tag type="is-warning" size="is-small">
         You may be logged in from more than one device.
        </b-tag>
      </b-navbar-item>
      <b-navbar-item tag="div" class="buttons">
        <slot name="end" />
        <b-button
          v-if="user.permitAdmin"
          type="is-dark"
          outlined
          inverted
          tag="n-link"
          to="/admin"
        >
          Admin
        </b-button>
        <!-- Logout Button -->
        <b-button
          @click="logoutHandler()"
          type="is-danger"
          icon-left="sign-out-alt"
        >
          Log Out, {{ user.name }}
        </b-button>

        <!-- Help Menu -->
        <Help v-if="helpText" :title="helpTitle" :text="helpText" />
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script>
// Import Mixins
import User from "~/mixins/User";

// Import Components
import Help from "~/components/modals/Help";

// Import Utilities
import { noop } from "~/assets/util";

export default {
  name: "NavBar",
  mixins: [User],
  components: { Help },
  props: {
    title: {
      type: String,
      required: false,
      default: "",
    },
    path: {
      type: String,
      required: false,
      default: "",
    },
    helpText: String,
    helpTitle: String,
    logout: Function,
  },
  data() {
    return {
      routes: [
        {
          name: "assets",
          path: "/assets",
        },
        {
          name: "scenarios",
          path: "/scenarios",
        },
      ],
      env: { MODE: process.env.MODE, BRANCH: process.env.BRANCH },
    };
  },
  methods: {
    logoutHandler() {
      this.logout ? this.logout() : this.$auth.logout();
    },
  },
};
</script>

<style scoped lang="scss">
// Fix since navbar needs to be higher index than toolbar/conditionbar to open help modal
.navbar {
  z-index: $buefyOverlapIndex + 3 !important;
}

.hide-if-empty:empty {
  display: none;
}
</style>
