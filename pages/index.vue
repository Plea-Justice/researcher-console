<template>
  <section class="section login-wrapper">
    <form class="box has-text-centered login" @submit.prevent="onSubmit">
      <div class="block">
        <b-icon icon="account-circle" size="is-large" />
      </div>

      <b-field type="username">
        <b-input placeholder="User ID" v-model="name" />
      </b-field>

      <b-field>
        <b-input type="password" placeholder="Password" password-reveal />
      </b-field>

      <b-button
        tag="input"
        native-type="submit"
        type="is-primary"
        value="Login"
      />

      <hr />

      <n-link to="/" :prefetch="false">Create an account</n-link>
    </form>
  </section>
</template>

<script>
export default {
  name: "Login Page",
  data() {
    return {
      name: ""
    };
  },
  methods: {
    onSubmit() {
      this.$router.push("/storyboard");
      this.name = "";
    }
  },
  head() {
    return {
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
