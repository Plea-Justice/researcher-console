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

          <form-group
            v-if="isRegistration"
            :validator="$v.loginForm.email"
            :messages="{
              required: 'Please add an email',
              email: 'A valid email address is required',
            }"
          >
            <b-input
              v-model="$v.loginForm.email.$model"
              icon="envelope"
              placeholder="Email"
            />
          </form-group>

          <form-group
            v-if="isRegistration"
            :validator="$v.loginForm.profession"
            :messages="{ required: 'Please list your profession' }"
          >
            <b-input
              v-model="$v.loginForm.profession.$model"
              icon="graduation-cap"
              placeholder="Profession"
            />
          </form-group>

          <form-group
            v-if="isRegistration"
            :validator="$v.loginForm.affiliation"
            :messages="{
              required: 'Please list the institution you are affiliated with',
            }"
          >
            <b-input
              v-model="$v.loginForm.affiliation.$model"
              icon="university"
              placeholder="Institutional Affiliation"
            />
          </form-group>

          <form-group
            :validator="$v.loginForm.username"
            :messages="{
              required: isRegistration
                ? 'Please make a username'
                : 'Please enter your username',
              minLength: 'Username must be at least 3 characters',
            }"
          >
            <b-input
              v-model="$v.loginForm.username.$model"
              icon="user"
              placeholder="Username"
            />
          </form-group>

          <form-group
            :validator="$v.loginForm.password"
            :messages="{
              required: isRegistration
                ? 'Please make a password'
                : 'Please enter your password',
              minLength: 'Password must be at least 10 characters',
            }"
          >
            <b-input
              v-model="$v.loginForm.password.$model"
              type="password"
              icon="lock"
              placeholder="Password"
              password-reveal
            />
          </form-group>

          <b-button
            native-type="submit"
            :loading="submitState.loading"
            :label="submitText"
            :icon-left="
              submitState.icon(isRegistration ? 'user-plus' : 'sign-in-alt')
            "
            :type="submitState.type('is-primary')"
            expanded
          >
          </b-button>

          <hr />

          <b-button @click="toggleFormMode()" type="is-text">
            {{
              isRegistration ? "Login to existing account" : "Create an account"
            }}
          </b-button>
        </form>
        <b-message
          v-if="envMode == 'development'"
          class="is-size-7 mt-5"
          style="width: 35em"
          :closable="false"
          type="is-warning"
          size="small"
          title="You are viewing a test instance of the application!"
        >
          This instance is not the official version of the console and it may be
          unstable. Information may be unexpectedly modified or deleted at any
          point. If this occurs, you may simply re-create your account.
        </b-message>
      </section>
    </div>
  </div>
</template>

<script>
// Import Mixins
import ButtonStateMixin, { ButtonState } from "~/mixins/ButtonState";

// Import Vuelidate Rules
import {
  required,
  minLength,
  maxLength,
  email,
} from "vuelidate/lib/validators";

export default {
  mixins: [ButtonStateMixin],
  data() {
    // Template for Form
    const LoginForm = {
      email: "",
      profession: "",
      affiliation: "",
      username: "",
      password: "",
    };

    return {
      LoginForm,
      loginForm: Object.assign({}, LoginForm),

      submitState: null,

      isRegistration: false,
      loading: false,
      envMode: process.env.MODE,
    };
  },
  validations() {
    if (this.isRegistration) {
      return {
        loginForm: {
          email: {
            required,
            email,
            maxLength: maxLength(50),
          },
          profession: {
            required,
            maxLength: maxLength(50),
          },
          affiliation: {
            required,
            maxLength: maxLength(50),
          },
          username: {
            required,
            minLength: minLength(3),
            maxLength: maxLength(50),
          },
          password: {
            required,
            minLength: minLength(10),
            maxLength: maxLength(50),
          },
        },
      };
    } else {
      return {
        loginForm: {
          username: { required },
          password: { required },
        },
      };
    }
  },
  created() {
    this.submitState = new ButtonState(this.ButtonStatus);
  },
  computed: {
    submitText() {
      let text = "";
      if (this.submitState.status === this.ButtonStatus.NORMAL)
        text = this.isRegistration ? "Create Account" : "Login";
      return text;
    },
  },
  methods: {
    toggleFormMode() {
      if (this.isRegistration) this.$v.loginForm.$reset();
      else {
        Object.keys(this.loginForm).forEach((field) => {
          if (this.loginForm[field] !== "") this.$v.loginForm[field].$touch();
        });
      }
      this.isRegistration = !this.isRegistration;
    },
    async login() {
      this.submitState.loading = true;

      // Only touch invalid fields (we don't want to show green fields in login)
      Object.keys(this.$v.loginForm).forEach(async (key) => {
        const validator = this.$v.loginForm[key];
        if (validator?.$invalid) await validator.$touch();
      });

      if (this.$v.loginForm.$invalid) {
        this.$buefy.toast.open({
          message: "Please fill in empty fields",
          type: "is-danger",
        });

        this.submitState.setTempStatus(this.ButtonStatus.ERROR);
      } else {
        try {
          const { username, password } = this.loginForm;
          const response = await this.$auth.loginWith("local", {
            data: {
              username,
              password,
            },
          });
        } finally {
          if (response.success) {
            this.submitState.setTempStatus(this.ButtonStatus.SUCCESS);
            this.loginForm = Object.assign({}, this.LoginForm);
            this.$v.loginForm.$reset();
          } else {
            this.submitState.setTempStatus(this.ButtonStatus.ERROR);
            this.loginForm.password = "";
          }
        }
      }
    },
    async register() {
      this.submitState.loading = true;

      // Check fields
      await this.$v.loginForm.$touch();
      if (this.$v.loginForm.$invalid) {
        this.$buefy.toast.open({
          message: "Errors exists, please fix incorrect fields",
          type: "is-danger",
        });

        this.submitState.setTempStatus(this.ButtonStatus.ERROR);
      } else {
        try {
          await this.$axios.$post("/api/v1/auth/register", this.loginForm);
          this.loading = false;
        } finally {
          if (response.success) {
            this.submitState.setTempStatus(this.ButtonStatus.SUCCESS);
            const successToast = this.$buefy.toast.open({
              message: "Account created, logging you in",
              type: "is-success",
              duration: 1000,
            });
            setTimeout(() => this.login(), 1000);
          } else {
            this.submitState.setTempStatus(this.ButtonStatus.ERROR);
            this.loginForm.password = "";
          }
        }
      }
    },
  },
  head() {
    return {
      title: `${this.$siteConfig.title} | Login`,
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Authentication Portal",
        },
      ],
    };
  },
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
