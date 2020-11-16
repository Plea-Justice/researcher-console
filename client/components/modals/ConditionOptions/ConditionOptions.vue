<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Condition {{ index + 1 }}</p>
    </header>
    <section class="modal-card-body">
      <b-tabs>
        <b-tab-item label="Tags">
          <Tags :conditionId="condition.id" :conditionTags="condition.tags" />
        </b-tab-item>

        <b-tab-item label="Asset Customization">
          <AssetCustomization />
        </b-tab-item>
      </b-tabs>
    </section>
    <footer class="modal-card-foot"></footer>
  </div>
</template>

<script>
// Import Components
import AssetCustomization from "~/components/modals/ConditionOptions/AssetCustomization";
import Tags from "~/components/modals/ConditionOptions/Tags";

export default {
  components: { AssetCustomization, Tags },
  props: {
    index: {
      type: String,
      required: true,
    },
    condition: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
/* FIXME: come up with a common style fix for cards */
.modal-card {
  min-width: 25vw;
  max-width: 90vw;
  width: auto;
  max-height: 90vh;
  margin-left: auto !important;
  margin-right: auto !important;

  & > .modal-card-body {
    //FIXME: set max-height
  }
}
</style>
