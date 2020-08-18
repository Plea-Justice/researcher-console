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

      <!-- FIXME: required doesn't work currently -->
      <div class="input-wrapper">
        <b-field label="File Upload">
<<<<<<< HEAD
          <b-field class="file fix-field-max-width">
            <b-upload
              v-model="assetForm.file"
              accept=".js, .jpg, .png"
              native
              :expanded="!assetForm.file"
            >
              <b-button
                tag="a"
                icon-left="cloud-upload-alt"
                type="is-primary"
                :expanded="!assetForm.file"
              >
                <span v-if="!assetForm.file">Click to upload</span>
              </b-button>
=======
          <b-field>
            <!-- FIXME: Required upload is problematic. -->
            <b-upload v-model="assetForm.file" accept=".js, .jpg, .png" native>
              <a class="button is-light">
                <b-icon size="is-small" icon="cloud-upload-alt" />
                <span>{{ assetForm.file.name || "Click to upload" }}</span>
              </a>
>>>>>>> 941d4e6328b4b5034274564d6810867e2ca1806f
            </b-upload>
            <span class="file-name" v-if="assetForm.file">{{ assetForm.file.name }}</span>
            <HelpSidebar :text="assetsHelp.upload" title="Asset Uploads" class="control" />
          </b-field>
        </b-field>

        <b-field label="Asset Type">
          <b-field>
            <b-select placeholder="Select a type" v-model="assetForm.type" expanded required>
              <option v-for="type in types" :key="type" :value="type">
                {{
                type | capitalize
                }}
              </option>
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
</style>

<style lang="scss" scoped>
.flex-grow {
  flex-grow: 1;
}
</style>
