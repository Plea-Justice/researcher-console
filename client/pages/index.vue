<template>
  <div class="hero is-primary is-bold is-fullheight">
    <div class="hero-body">
      <section class="container login-wrapper">
        <h1 class="title login-title">Plea Simulation Researcher Console</h1>

        <!-- Login Card -->
        <form class="box has-text-centered" @submit.prevent="isRegistration ? register() : login()">
          <div class="block">
            <b-icon icon="account-circle" size="is-large" />
          </div>

          <b-field v-if="isRegistration">
            <b-input v-model="email" type="email" icon="email" 
              validation-message="A valid email address is required." maxlength="100" :has-counter="isRegistration"
               placeholder="Email" required />
          </b-field>

          <b-field>
            <b-input v-model="name" icon="account" v-bind:minlength="isRegistration ? 3 : 0" maxlength="100" :has-counter="isRegistration"
              validation-message="Username must be at least 3 characters." placeholder="Username" required />
          </b-field>

          <b-field>
            <b-input v-model="password" type="password" icon="lock" v-bind:minlength="isRegistration ? 10 : 0" maxlength="100" :has-counter="isRegistration"
              validation-message="Password must be at least 10 characters." placeholder="Password" required password-reveal />
          </b-field>
          <div class="buttons is-centered">
            <!-- FIXME: should submit and let form login -->

            <b-button
              v-if="!isRegistration"
              tag="input"
              native-type="submit"
              value="Login"
              icon-right="login-variant"
              type="is-primary"
              expanded
            />

            <b-button
              v-else
              tag="input"
              native-type="submit"
              value="Create Account"
              icon-right="account-plus"
              type="is-primary"
              expanded
            />
          </div>

          <hr />

          <b-button
            @click="setFormMode()"
            type="is-text"
          >{{ isRegistration ? "Login to existing account" : "Create an account" }}</b-button>
        </form>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginPage",
  data() {
    return {
      isRegistration: false,
      email: "",
      name: "",
      password: ""
    };
  },
  methods: {
    setFormMode() {
      this.isRegistration = !this.isRegistration;
    },
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
          message:
            "response" in err && err.response != undefined
              ? err.response.data.message
              : err,
          type: "is-danger"
        });
      }
      //FIXME: hash
      this.name = "";
      this.password = "";

      this.$router.push("/scenarios");
    },
    async register() {
      try {
        let response = await this.$axios.post("/api/v1/auth/register", {
          email: this.email,
          username: this.name,
          password: this.password
        });

        this.$buefy.toast.open({
          message: response.data.message,
          type: "is-success"
        });
      } catch (err) {
        this.$buefy.toast.open({
          message:
            "response" in err && err.response != undefined
              ? err.response.data.message
              : err,
          type: "is-danger"
        });
      }

      this.email = "";
      this.name = "";
      this.password = "";
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

<style scope>
.login-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.login-title {
  text-align: center;
}
</style>
