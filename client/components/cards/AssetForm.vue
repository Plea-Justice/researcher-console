<template>
  <form @submit.prevent="$emit('submit')">
    <ItemCard save>
      <template v-slot:header>
        <b-button @click="$emit('close')" icon-left="times" type="is-text" />
      </template>

      <div class="input-wrapper">
        <b-field label="File Upload">
          <b-field
            class="file is-primary fix-field-max-width"
            :class="{ 'has-name': assetForm.file }"
          >
            <b-upload
              v-model="assetForm.file"
              class="file-label"
              required
              expanded
            >
              <span
                class="button file-cta"
                :class="{ 'is-fullwidth': !assetForm.file }"
              >
                <b-icon class="file-icon" icon="cloud-upload-alt" />
                <span v-if="!assetForm.file" class="file-label">
                  Click to upload
                </span>
              </span>
              <span class="file-name control" v-if="assetForm.file">
                {{ assetForm.file.name }}
              </span>
            </b-upload>
            <HelpSidebar
              :text="assetsHelp.upload"
              title="Asset Uploads"
              class="control"
            />
          </b-field>
        </b-field>

        <b-field label="Asset Type">
          <b-field>
            <b-select
              placeholder="Select a type"
              v-model="assetForm.type"
              expanded
              required
            >
              <option v-for="type in types" :key="type" :value="type">
                {{ type | capitalize }}
              </option>
            </b-select>
            <HelpSidebar
              :text="assetsHelp.type"
              title="Asset Types"
              class="control"
            />
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
  }
};
</script>

<!-- Global Style -->
<style lang="scss">
.fix-field-max-width {
  & > .field-body {
    max-width: 100%;
    .field.has-addons {
      max-width: 100%;
    }
  }
}

/* .file.has-name .upload {
  z-index: 1;
} */

.file-name.control {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
