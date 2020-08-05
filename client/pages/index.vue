<template>
  <div class="hero is-primary is-bold is-fullheight">
    <div class="hero-body">
      <section class="container login-wrapper">
        <h1 class="title login-title">Plea Simulation Researcher Console</h1>

        <!-- Login Card -->
        <form
          class="box has-text-centered"
          @submit.prevent="isRegistration ? register() : login()"
        >
          <div class="block">
            <b-icon icon="user-circle" size="is-large" />
          </div>

          <!-- FIXME: inputs need to re-validate when switching between form types -->
          <b-field v-if="isRegistration">
            <b-input
              v-model="loginForm.email"
              type="email"
              icon="envelope"
              validation-message="A valid email address is required."
              maxlength="100"
              :has-counter="isRegistration"
              placeholder="Email"
              required
            />
          </b-field>

          <!-- FIXME: binding minlength doesn't seem to work -->
          <b-field>
            <b-input
              v-model="loginForm.username"
              icon="user"
              :minlength="isRegistration ? 3 : 0"
              maxlength="100"
              :has-counter="isRegistration"
              validation-message="Username must be at least 3 characters."
              placeholder="Username"
              required
            />
          </b-field>

          <b-field>
            <b-input
              v-model="loginForm.password"
              type="password"
              icon="lock"
              v-bind:minlength="isRegistration ? 10 : 0"
              maxlength="100"
              :has-counter="isRegistration"
              validation-message="Password must be at least 10 characters."
              placeholder="Password"
              required
              password-reveal
            />
          </b-field>

          <div class="buttons is-centered">
            <b-button
              v-if="!isRegistration"
              tag="input"
              native-type="submit"
              value="Login"
              icon-left="sign-in-alt"
              type="is-primary"
              expanded
            />

            <b-button
              v-else
              tag="input"
              native-type="submit"
              value="Create Account"
              icon-left="user-plus"
              type="is-primary"
              expanded
            />
          </div>

          <hr />

          <b-button @click="setFormMode()" type="is-text">
            {{
              isRegistration ? "Login to existing account" : "Create an account"
            }}
          </b-button>
        </form>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginPage",
  data() {
    // Template for Form
    const LoginForm = {
      email: "",
      username: "",
      password: ""
    };

    return {
      LoginForm,
      loginForm: Object.assign({}, LoginForm),

      isRegistration: false
    };
  },
  methods: {
    setFormMode() {
      this.isRegistration = !this.isRegistration;
    },
    async login() {
      const response = this.$auth.loginWith("local", {
        data: {
          username: this.loginForm.username,
          password: this.loginForm.password
        }
      });

      if (response.success) {
        // Reset inputs
        this.loginForm = Object.assign({}, this.LoginForm);
      } else {
        this.loginForm.password = "";
      }
    },
    async register() {
      const response = await this.$axios.post(
        "/api/v1/auth/register",
        this.loginForm
      );

      // FIXME: After a 500 on unsuccesful creation nothing happens after this so
      // this can never be handled (reset password field, etc.)

      if (response.data.success) {
        // Reset inputs
        this.loginForm = Object.assign({}, this.LoginForm);

        console.log(response.data.message);
        this.$buefy.toast.open({
          message: response.data.message,
          type: "is-success"
        });
      } else {
        this.loginForm.password = "";
      }

      // TODO: auto login after creating an account
    }
  },
  head() {
    return {
      title: `${this.$siteConfig.title} | Login`,
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Authentication Portal"
        }
      ]
    };
  }
};
</script>

<style lang="scss" scope>
.login-wrapper {
  @include flexCenter();
  flex-direction: column;
  height: 100%;
}

.login-title {
  text-align: center;
}
</style>
