<template>
  <!-- FIXME: fix how form interaction works either make form top level again or use more effectively here -->
  <form ref="form" class="flex-wrap">
    <div v-if="selectable && $v.form.$invalid" class="invalid-selection-mask" />
    <GenericCard
      @remove="removeScene(isBound ? bound : scene.id)"
      @selected="$emit('selected', scene.id)"
      :selectable="selectable && !$v.form.$invalid"
      :collapsed="collapsed"
      :blank="isBlank"
      :invalid="$v.form.$invalid"
      close
    >
      <template v-slot:default>
        <!-- Scene Type Toggle -->
        <b-field class="is-capitalized field-centered">
          <b-radio-button
            v-for="type in validSceneTypes"
            :key="type"
            v-model="$v.form.type.$model"
            :native-value="type"
            :disabled="isBound"
          >{{ type }}</b-radio-button>
        </b-field>

        <!-- options props needs a preloaded value because .includes in AssetNamesByType will return false positive while loading -->
        <template v-for="field in validFieldNames">
          <form-group
            :key="field"
            v-if="isType(field, ['image', 'video'])"
            :validator="$v.form[field]"
          >
            <FileSelector
              :validator="$v.form[field]"
              v-model="$v.form[field].$model"
              :options="AssetNamesByType[field]"
              :label="field"
              :icon="getIcon(field)"
              :disabled="isBound"
              class="is-capitalized"
              expanded
            />
          </form-group>

          <form-group
            :key="field"
            v-if="isType(field, 'text')"
            :validator="$v.form[field]"
            :label="field"
            class="is-capitalized"
          >
            <b-input
              v-model="$v.form[field].$model"
              :disabled="isBound"
              :placeholder="`${field}...` | capitalize"
              type="textarea"
              custom-class="has-fixed-size"
              expanded
            />
          </form-group>

          <BTagInput
            :key="field"
            v-if="isType(field, 'buttons')"
            :label="field"
            v-model="form[field]"
            :disabled="isBound"
            class="is-capitalized"
            expanded
          />

          <!-- TODO: Display error for incorrect types/types that don't match anything ?-->
        </template>
      </template>

      <template v-slot:footer v-if="isBound">
        <b-button @click="unbindScene({ id: bound, props: scene.id })" icon-left="unlink" />
      </template>
    </GenericCard>
  </form>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Vuelidate Rules
import { required, maxLength } from "vuelidate/lib/validators";
import { helpers } from "vuelidate/lib/validators";

// Import Components
import GenericCard from "~/components/cards/GenericCard";
import FileSelector from "~/components/form/FileSelector";
import BTagInput from "~/components/form/BTagInput";

// Import Helper Functions
import { debounce } from "~/assets/util";

// FIXME: formalize spec
// FIXME: code-split import this
import spec from "~/assets/spec.json";

export default {
  name: "Scene",
  components: {
    GenericCard,
    FileSelector,
    BTagInput
  },
  props: {
    scene: {
      type: Object,
      required: true
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    },
    selectable: {
      type: Boolean,
      required: false,
      default: false
    },
    bound: {
      type: [String, Boolean],
      required: false,
      default: false
    }
  },
  data() {
    const form = {
      ...Object.fromEntries(Object.keys(spec.scene).map(key => [key, null])),
      ...this.scene.props
    };

    return {
      validSceneTypes: Object.keys(spec.sceneTypes),
      form
    };
  },
  validations() {
    // FIXME: add error message
    // FIXME: extend this from main vuelidate.js ?
    const included = options => value =>
      !helpers.req(value) || (options ? options.includes(value) : false);

    const dynamicEntries = Object.fromEntries(
      Object.entries(spec.scene).map(([key, val]) => {
        if (val === "image" || val === "video") {
          return [key, { included: included(this.AssetNamesByType[key]) }];
        } else {
          return [key, {}];
        }
      })
    );

    return {
      form: {
        ...dynamicEntries,
        type: {
          required
        },
        script: {
          maxLength: maxLength(220)
        },
        buttons: {}
      }
    };
  },
  watch: {
    // Update form for inbound changes
    "scene.props": async function() {
      Object.assign(this.form, this.scene.props);
      // this.$v.form.$reset();
    },
    // Update props with outbound changes
    form: {
      deep: true,
      handler: debounce(async function() {
        this.updateScene({
          id: this.scene.id,
          props: this.form,
          valid: !this.$v.form.$invalid
        });
        // await this.$v.form.$reset();
      }, 350)
    }
    //FIXME: get $anyDirty working so we don't have to deep watch
    /* "$v.form.$anyDirty": function() {
      if (this.$v.form.$anyDirty) {
        debounce(async function() {
          console.log("Running");
          await this.$v.form.$touch();
          this.updateScene({
            id: this.scene.id,
            props: this.form,
            valid: !this.$v.form.$invalid
          });
          await this.$v.form.$reset();
        }, 350)();
      }
    } */
  },
  computed: {
    isBound() {
      return this.bound ? true : false;
    },
    isBlank() {
      return this.scene.props == null;
    },
    validFieldNames() {
      return spec.sceneTypes[this.scene.props.type];
    },
    ...mapGetters({
      assetSet: "assets/assetSet"
    }),
    AssetNamesByType() {
      return this.assetSet.reduce(
        (obj, item) => (
          obj[item.type]
            ? obj[item.type].push(item.name)
            : (obj[item.type] = [item.name]),
          obj
        ),
        {}
      );
    }
  },
  methods: {
    isType(field, validTypes) {
      const targetType = spec.scene[field];
      return Array.isArray(validTypes)
        ? validTypes.some(type => targetType === type)
        : targetType === validTypes;
    },
    // TODO: make this a enum in data?
    getIcon(field) {
      const type = spec.scene[field];
      let icon = "";
      if (type === "image") {
        icon = "file-image";
      } else if (type === "video") {
        icon = "file-video";
      }
      return icon;
    },
    ...mapActions({
      removeScene: "scenario/removeScene",
      updateScene: "scenario/updateScene",
      unbindScene: "scenario/unbindScene",
      setSceneInvalid: "scenario/setSceneInvalid",
      setSceneValid: "scenario/setSceneValid",
      updateSceneForm: "scenario/updateSceneForm"
    })
  }
};
</script>

<!-- Global Style -->
<style lang="scss">
.field-centered {
  & > .field-body > .field {
    justify-content: center;
  }
}
</style>

<style lang="scss" scoped>
.flex-wrap {
  position: relative;
  display: flex;
  flex-grow: 1;
}

.invalid-selection-mask {
  @include absoluteMask();
  background-color: $selectedRed;
  border-radius: $radius-large;
}

.card {
  height: 100%;
}

.header-input {
  flex-grow: 1;
}
</style>
