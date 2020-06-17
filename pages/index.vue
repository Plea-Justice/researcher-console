<template>
  <section class="login-wrapper">
    <h1 class="title login-title">
      <!-- FIXME: use an environment variable -->
      Plea Simulation Researcher Console
    </h1>

    <form class="box has-text-centered login" @submit.prevent="login()">
      <div class="block">
        <b-icon icon="account-circle" size="is-large" />
      </div>

      <b-field>
        <b-input placeholder="User ID" v-model="name" />
      </b-field>

      <b-field>
        <b-input type="password" placeholder="Password" password-reveal v-model="password" />
      </b-field>

      <div class="buttons is-centered">
        <!-- FIXME: should submit and let form login -->
        <b-button @click="login()" type="is-primary" icon-right="login-variant" expanded>Login</b-button>
        <b-button
          @click="register()"
          type="is-primary"
          icon-right="account-plus"
          expanded
        >Create Account</b-button>
      </div>

      <hr />

      <b-button type="is-text" :prefetch="false">Create Account</b-button>
    </form>
  </section>
</template>

<script>
export default {
  name: "LoginPage",
  layout: "LoginLayout",
  data() {
    return {
      name: "",
      password: ""
    };
  },
  methods: {
    async login() {
      // FIXME: 404 uncaught
      try {
        await this.$auth.loginWith("local", {
          data: {
            username: this.name,
            password: this.password
          }
        });
      } catch (err) {
        this.$buefy.toast.open({
          message: err.response.data.message,
          type: "is-danger"
        });
      }
      //FIXME: hash
      this.name = "";
      this.password = "";

      //FIXME: redirect on 404
      // Unprotected
      this.$router.push("/storyboard");
    },
    async register() {
      try {
        let response = await this.$axios.post("/api/v1/auth/register", {
          username: this.name,
          password: this.name
        });

        this.$buefy.toast.open({
          message: response.data.message,
          type: "is-success"
        });
      } catch (err) {
        this.$buefy.toast.open({
          message: err.response.data.message,
          type: "is-danger"
        });

        console.log(err.response.data);
      }
    }
  },
  head() {
    return {
      //FIXME: use env var
      title: `PleaBargain | Login`,
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
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.login-title {
  margin-bottom: 8rem;
}

.login {
  max-width: 40%;
}
</style>
