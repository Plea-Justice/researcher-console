<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Shared Assets</p>
    </header>
    <section class="modal-card-body">
      <div class="item-grid">
        <div v-for="asset in assetSet" :key="asset.id">
          <ItemCard
            v-if="!asset.public"
            :item="asset"
            :itemType="'scenario'"
            duplicate
            @duplicate="copyAsset($event)"
            link
          >
            <p class="content is-small">
              <span>Created {{ asset.created | timeToNow }}</span>
            </p>
          </ItemCard>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import ItemCard from "~/components/cards/ItemCard";

export default {
  components: { ItemCard },
  computed: {
    ...mapGetters({
      assetSet: "assets/assetSet"
    })
  },
  methods: {
    ...mapActions({
      addAsset: "assets/addAsset"
    }),
    copyAsset(id) {
      //FIXME: needs check for duplicates
      this.addAsset({
        ...this.assetSet.find(asset => asset.id === id)
      });
    }
  }
};
</script>

<style>
/* FIXME: This will break things */
.animation-content {
  max-width: unset !important;
}
</style>

<style scoped>
.modal-card {
  width: 90vw;
}

.modal-card-body {
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

.item-grid {
  padding: 1rem 2rem;
}
</style>
