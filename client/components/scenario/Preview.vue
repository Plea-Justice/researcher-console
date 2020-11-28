<template>
  <ToolBarButton @click="preview()" type="is-primary" icon-left="eye">
    Preview
  </ToolBarButton>
</template>

<script>
export default {
  methods: {
    async preview() {
      // TODO: Ask on unsaved, invalid, etc.
      // Create an array of warnings & display the messages accordingly
      if (!this.scenarioMeta.survey) {
        this.$buefy.dialog.alert({
          title: "Survey Redirect Not Set",
          message:
            'Please set the survey URL. This can be found under the "Options" Toolbar Button',
          type: "is-warning",
          hasIcon: true,
          icon: "exclamation-triangle",
          onConfirm: () => setTimeout(this.$emit("openScenarioOptions"), 150),
        });
      } else {
        this.loading = true;

        try {
          const res = await this.$axios.post(
            `/api/v1/scenarios/${this.scenarioMeta.id}/preview`
          );
          this.loading = false;
          this.setSubmitState(this.SubmitState.SUCCESS);
        } catch (error) {
          this.loading = false;
          this.setSubmitState(this.SubmitState.ERROR);
        }
      }
    },
  },
};
</script>
