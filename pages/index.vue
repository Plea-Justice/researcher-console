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
        <b-input type="password" placeholder="Password" password-reveal v-model="pass" />
      </b-field>

      <div class="buttons is-centered">
        <b-button @click="login" type="is-primary" icon-left="login-variant" expanded>Login</b-button>
        <b-button
          @click="register"
          type="is-primary"
          icon-left="account-plus"
          expanded
        >Create Account</b-button>
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
      name: "",
      pass: ""
    };
  },
  methods: {
    async login() {
      try {
        await this.$auth.loginWith("local", {
          data: {
            username: this.name,
            password: this.pass
          }
        });
      } catch (err) {
        this.$buefy.toast.open({
          message: err.response.data.message,
          type: "is-danger"
        });
      }
      this.name = "";
      this.pass = "";
      this.$router.push("/storyboard");
    },
    async register() {
      try {
        let r = await this.$axios.post("/api/v1/auth/register", {
          username: this.name,
          password: this.name
        });

        this.$buefy.toast.open({
          message: r.data.message,
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
