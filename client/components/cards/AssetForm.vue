<template>
  <form @submit.prevent="$emit('submit')">
    <ItemCard save>
      <template v-slot:header>
        <b-input
          ref="focus_target"
          v-model="assetForm.name"
          placeholder="Name"
          class="flex-grow"
          required
        />

        <b-button @click="$emit('close')" icon-left="times" type="is-text" />
      </template>

      <div class="input-wrapper">
        <b-field label="File Upload">
          <b-field>
            <!-- FIXME: Required upload is problematic. -->
            <b-upload v-model="assetForm.file" accept=".js, .jpg, .png" native>
              <a class="button is-light">
                <b-icon size="is-small" icon="cloud-upload-alt" />
                <span>{{ assetForm.file.name || "Click to upload" }}</span>
              </a>
            </b-upload>
            <HelpSidebar :text="assetsHelp.upload" title="Asset Uploads" class="control" />
          </b-field>
        </b-field>

        <b-field label="Asset Type">
          <b-field>
            <b-select placeholder="Select a type" v-model="assetForm.type" expanded required>
              <option v-for="type in types" :key="type" :value="type">{{ type | capitalize }}</option>
            </b-select>
            <HelpSidebar :text="assetsHelp.type" title="Asset Types" class="control" />
          </b-field>
        </b-field>
      </div>
    </ItemCard>
  </form>
</template>

<script>
// Content for help fields
import { assetsHelp } from "~/assets/helpText";

// Import Components
import ItemCard from "~/components/cards/ItemCard";
import HelpSidebar from "~/components/HelpSidebar";

export default {
  components: { ItemCard, HelpSidebar },
  props: {
    assetForm: {
      type: Object,
      required: true
    },
    types: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      assetsHelp
    };
  },
  methods: {
    focus() {
      this.$refs.focus_target.focus();
    }
  }
};
</script>

<style scoped>
.flex-grow {
  flex-grow: 1;
}
</style>
