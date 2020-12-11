<template>
  <div class="modal-card" style="width: 30vw">
    <form @submit.prevent="onSubmit()">
      <header class="modal-card-head">
        <p class="modal-card-title">{{addMode ? 'Add' : 'Edit' }} Asset</p>
      </header>
      <section class="modal-card-body">
        <b-field v-if="addMode" label="File Upload">
          <b-field
            class="file is-primary no-help"
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
            <Help
              :text="assetsHelp.upload"
              title="Asset Uploads"
              class="control"
            />
          </b-field>
        </b-field>

        <b-field v-if="addMode" label="Asset Type" class="no-help">
          <b-select
            placeholder="Select a type"
            v-model="assetForm.type"
            expanded
            required
          >
            <option v-for="type in allAssetTypes" :key="type" :value="type">
              {{ type | capitalize }}
            </option>
          </b-select>
          <Help :text="assetsHelp.type" title="Asset Types" class="control" />
        </b-field>

        <b-field label="Description">
          <b-input
            v-model="assetForm.description"
            type="textarea"
            placeholder="Description"
            customClass="has-fixed-size"
            maxlength="250"
          />
        </b-field>

        <div class="flex-field-wrapper">
          <b-field
            label="Share with Others"
            class="flex-field"
            :message="
              assetForm.public
                ? 'You acknowledge that your asset may be used in others\' experiments.'
                : ''
            "
          >
            <b-tooltip
              :active="!user.permitSharing"
              label="You're not permitted share files, request persmission from an admin"
              position="is-bottom"
              type="is-info is-light"
            >
              <b-switch
                :disabled="!user.permitSharing"
                v-model="assetForm.public"
                type="is-info"
              >
                Make Public
              </b-switch>
            </b-tooltip>
          </b-field>
          <Help :text="assetsHelp.sharing" title="Asset Types" />
        </div>

        <b-field
          label="Citation"
          v-if="assetForm.public"
          message="This is how others will cite your work."
        >
          <b-input
            v-model="assetForm.citation"
            placeholder="e.g. Smith, J. (2020). Title of artwork [Digital]."
            customClass="has-fixed-size"
            maxlength="100"
          />
        </b-field>
      </section>

      <footer class="modal-card-foot">
        <b-button type="is-primary" native-type="submit" expanded>
          Save
        </b-button>
      </footer>
    </form>
  </div>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Content for help fields
import { assetsHelp } from "~/assets/helpText";

// Import Components
import Help from "~/components/modals/Help";

export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
    asset: Object,
    mode: {
      type: String,
      default: 'add'
    }
  },
  data() {
    return {
      assetsHelp,
      assetForm: {
        type: null,
        file: null,
        public: false,
        readOnly: false,
        description: "",
        citation: "",
        ...this.asset,
      },
    };
  },
  components: { Help },
  computed: {
    addMode() {
      return !this.asset;
    },
    ...mapGetters({
      assetSet: "assets/assetSet",
      allAssetTypes: "assets/allAssetTypes",
    }),
  },
  methods: {
    ...mapActions({
      addAsset: "assets/addAsset",
      editAsset: "assets/editAsset"
    }),
    onSubmit() {
      // If that filename already exists
      // FIXME: check doesn't work (server removes spaces)
      if ( this.assetForm.file &&
        this.assetSet.some(
          ({ name }) =>
            name.toLowerCase() === this.assetForm.file.name.toLowerCase() &&
            id !== this.assetForm?.id
        )
      ) {
        this.$buefy.toast.open({
          message: "An asset with the same filename already exists",
          type: "is-danger",
        });

        this.assetForm.file = null;
        // TODO: This file upload size is defined in server config.js.
      } else if ( this.assetForm.file &&
        this.assetForm.file.size > 1024 * 1024 * 20) {
        this.$buefy.toast.open({
          message: `${this.assetForm.file.name} is too large, cannot upload field larger than 20MiB.`,
          type: "is-danger",
        });
      } else {
        console.log(this.assetForm.file);
        // Add the scenario to state
        try {
          this.addMode
            ? this.addAsset(this.assetForm)
            : this.editAsset(this.assetForm);
          this.$parent.close();
        } catch (error) {}
      }
    },
  },
};
</script>

<!-- Global Styles -->
<style lang="scss">
// FIXME: make these global for fixing max-width uploads?
.field.file {
  .field-body {
    max-width: 100%;
  }

  .field.has-addons {
    max-width: 100%;
  }

  .file-name {
    width: 100%;
    max-width: unset;
  }

  .file-name.control {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
}

// Remove default error messages when no-help class is applied
.field.no-help > .help {
  display: none;
}
</style>

<style scoped lang="scss">
.flex-field-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  // set default field margin-bottom
  margin-bottom: 0.75rem;
}

.flex-field {
  // clear field margin-bottom so lines up right in flexbox
  margin-bottom: 0;
}
</style>
