<template>
  <ItemCard
    v-on="$listeners"
    v-bind="$attrs"
    :item="{ id: asset.id, name: asset.name }"
    itemType="Asset"
  >
    <b-image
      :src="`${API_URL}/api/v1/assets/${asset.id}/thumbnail`"
      src-fallback="/defaultThumbnail.png"
      responsive
      ratio="16by9"
      lazy
    />

    <div class="asset-meta content is-small">
      <span> Uploaded {{ asset.created | timeToNow }} </span>
      <span class="is-pulled-right">{{ asset.owner }}</span>
      <p>{{ asset.description }}</p>
      <p v-if="asset.citation">Citation: {{ asset.citation }}</p>
    </div>

    <template v-slot:footer>
      <b-taglist style="margin-left: auto">
        <b-tag v-if="!hidepublic && asset.public" type="is-info">Public</b-tag>
        <b-tag type="is-primary">{{ asset.type | capitalize }}</b-tag>
      </b-taglist>
    </template>
  </ItemCard>
</template>

<script>
// Import Components
import ItemCard from "~/components/cards/ItemCard";

export default {
  components: { ItemCard },
  props: {
    asset: {
      type: Object,
      required: true,
    },
    hidepublic: Boolean,
  },
  data() {
    return {
      API_URL: process.env.API_URL,
    };
  },
};
</script>
