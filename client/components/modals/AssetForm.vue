<template>
  <div class="modal-card" style="width: 30vw">
    <form @submit.prevent="onSubmit()">
      <header class="modal-card-head">
        <p class="modal-card-title">Add Asset</p>
      </header>
      <section class="modal-card-body">
        <b-field label="File Upload">
          <b-field
            class="file is-primary fix-field-max-width no-help"
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
                <span v-if="!assetForm.file" class="file-label"
                  >Click to upload</span
                >
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

        <b-field label="Asset Type" class="no-help">
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
          <HelpSidebar
            :text="assetsHelp.type"
            title="Asset Types"
            class="control"
          />
        </b-field>

        <div class="flex-field-wrapper">
          <b-field
            label="Share with Others"
            class="flex-field"
          >
            <b-switch
              :disabled="!user.permitSharing"
              v-model="assetForm.public"
              type="is-info"
            >
              Make Public
            </b-switch>
          </b-field>
          <HelpSidebar :text="assetsHelp.sharing" title="Asset Types" />
        </div>
      </section>

      <footer class="modal-card-foot">
        <b-button type="is-primary" native-type="submit" value="Save" expanded>
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
import HelpSidebar from "~/components/HelpSidebar";

export default {
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      assetsHelp,
      assetForm: {
        type: null,
        file: null,
        public: false,
        readOnly: false
      }
    };
  },
  components: { HelpSidebar },
  computed: {
    ...mapGetters({
      assetSet: "assets/assetSet",
      allAssetTypes: "assets/allAssetTypes"
    })
  },
  methods: {
    ...mapActions({
      addAsset: "assets/addAsset"
    }),
    async onSubmit() {
      // If that filename already exists
      // FIXME: check doesn't work (server removes spaces)
      if (this.assetSet.some(({ name }) => name === this.assetForm.file.name)) {
        this.$buefy.toast.open({
          message: "An asset with the same filename already exists",
          type: "is-danger"
        });

        this.assetForm.file = "";
        // TODO: This file upload size is defined in server config.js.
      } else if (this.assetForm.file.size > 1024 * 1024 * 20) {
        this.$buefy.toast.open({
          message: `${this.assetForm.file.name} is too large, cannot upload field larger than 20MiB.`,
          type: "is-danger"
        });
      } else {
        // Add the scenario to state
        try {
          await this.addAsset(this.assetForm);
          this.$parent.close();
        } catch (error) {}
      }
    }
  }
};
</script>

<!-- Global Style -->
<style lang="scss">
// FIXME: make these global for fixing max-width uploads?
.fix-field-max-width {
  & > .field-body {
    max-width: 100%;
    .field.has-addons {
      max-width: 100%;
    }
  }
}

// FIXME: Not properly sizing
.file-name {
  width: 100%;
}

.file-name.control {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
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
