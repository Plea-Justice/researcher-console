export default {
  computed: {
    user() {
      return this.$auth.user || { name: 'dev', sessions: 1 };
    }
  }
};
