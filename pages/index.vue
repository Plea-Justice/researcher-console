<template>
  <section class="section login-wrapper">
    <form class="box has-text-centered login" @submit.prevent="loginEmail()">
      <div class="block">
        <b-icon icon="account-circle" size="is-large" />
      </div>

      <b-field>
        <b-input placeholder="User ID" v-model="name" />
      </b-field>

      <b-field>
        <b-input type="password" placeholder="Password" password-reveal />
      </b-field>

      <div class="buttons is-centered">
        <b-button @click="loginEmail" type="is-primary" expanded>
          Email Login
        </b-button>
        <b-button
          @click="loginGitHub()"
          type="is-primary"
          icon-left="github"
          expanded
        >
          Github Login
        </b-button>
      </div>

      <hr />

      <n-link to="/" :prefetch="false">Create an account</n-link>
    </form>
  </section>
</template>

<script>
export default {
  name: "LoginPage",
  layout: "LoginLayout",
  data() {
    return {
      name: ""
    };
  },
  methods: {
    loginEmail() {
      this.$router.push("/storyboard");
      this.name = "";
    },
    loginGitHub() {
      this.$auth.loginWith("github");
    }
  },
  head() {
    return {
      //FIXME: use env var
      title: `PleaBargain | ${this.name}`,
      meta: [
        {
          hid: "description",
          name: "description",
          content: "The Authentication Portal"
        }
      ]
    };
  }
};
</script>

<style scope>
.login-wrapper {
  display: flex;
  justify-content: center;
}

.login {
  max-width: 40%;
}
</style>
