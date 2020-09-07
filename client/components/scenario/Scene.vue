<template>
  <!-- FIXME: fix how form interaction works either make form top level again or use more effectively here -->
  <!-- If scene is not blank -->
  <form v-if="scene.props !== null" ref="form" class="flex-wrap">
    <div v-if="isSelectable && $v.form.$invalid" class="invalid-selection-mask" />
    <GenericCard
      @selected="$emit('selected', scene.id)"
      :selectable="isSelectable && !$v.form.$invalid"
      :collapsed="collapsed"
      :invalid="$v.form.$invalid"
    >
      <!-- Scene Type Toggle -->
      <b-field class="is-capitalized field-centered">
        <p class="control">
          <b-button
            @click="removeScene(isBound ? bound : scene.id)"
            type="is-danger is-light"
            icon-left="trash-alt"
          />
        </p>
        <template v-if="isBound">
          <p class="control bound-label">
            <b-button type="is-light" disabled expanded>Bound: Scene {{ index }}</b-button>
          </p>
          <p class="control">
            <b-button
              @click="unbindScene({ id: bound, props: scene.id })"
              icon-left="unlink"
              type="is-primary is-light"
            />
          </p>
        </template>

        <b-radio-button
          v-else
          v-for="type in validSceneTypes"
          :key="type"
          v-model="$v.form.type.$model"
          :native-value="type"
          :disabled="isBound"
          type="is-light is-primary"
        >{{ type }}</b-radio-button>
      </b-field>

      <form-group
        v-for="field in validFieldNames"
        :key="field"
        :validator="$v.form[field]"
        :label="field"
        label-position="inside"
        class="is-capitalized"
        v-slot="{ maxlength }"
      >
        <!--
          `options` prop needs a preloaded value because .includes in
          AssetsByType will return false positive while loading
        -->

        <FileSelector
          v-if="isType(field, 'selector')"
          :validator="$v.form[field]"
          v-model="$v.form[field].$model"
          :options="AssetsByType[field]"
          :icon="getIcon(field)"
          :disabled="isBound"
          expanded
        />

        <b-input
          v-else-if="isType(field, 'input')"
          v-model="$v.form[field].$model"
          :placeholder="`${field}...` | capitalize"
          :icon="getIcon(field)"
          :maxlength="maxlength"
          :disabled="isBound"
          class="absolute-counter"
          custom-class="has-fixed-size"
          type="textarea"
          expanded
        />

        <!-- FIXME: make sure tag input updates $dirty correctly -->
        <BTagInput
          v-else-if="isType(field, 'tag-input')"
          v-model="form[field]"
          :icon="getIcon(field)"
          :disabled="isBound"
          class="is-capitalized"
          expanded
        />

        <!-- TODO: Display error for incorrect types/types that don't match anything ? -->
      </form-group>
    </GenericCard>
  </form>

  <!-- Otherwise show blank scene -->
  <GenericCard v-else>
    <div class="center-card-content">
      <b-button @click="addScene(scene.id)" type="is-light" size="is-medium" icon-left="plus" />
    </div>
  </GenericCard>
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
    index: Number,
    collapsed: Boolean,
    selectable: [Object, Boolean],
    bound: {
      type: [String, Boolean],
      required: false,
      default: false
    }
  },
  data() {
    const defaultType = Object.keys(spec.sceneTypes)[0];
    const form = {
      ...Object.fromEntries(Object.keys(spec.scene).map(key => [key, null])),
      type: defaultType,
      ...this.scene.props
    };

    return {
      validSceneTypes: Object.keys(spec.sceneTypes),
      form
    };
  },
  mounted() {
    this.validFieldNames.forEach(fieldName => {
      const vField = this.$v.form[fieldName];
      if (vField.$invalid) vField.$touch();
    });
  },
  watch: {
    // Update form for inbound changes
    "scene.props": async function() {
      Object.assign(this.form, this.scene.props);
    },
    // Update props with outbound changes
    form: {
      deep: true,
      handler: debounce(async function() {
        this.updateScene({
          id: this.scene.id,
          props: Object.fromEntries(
            [...this.validFieldNames, "type"].map(field => [
              field,
              this.form[field]
            ])
          ),
          valid: !this.$v.form.$invalid
        });
      }, 350)
    }
  },
  validations() {
    // FIXME: add error message
    // FIXME: extend this from main vuelidate.js ?
    const included = options => value =>
      !helpers.req(value) || !!options?.[value.id];

    const dynamicEntries = Object.fromEntries(
      Object.entries(spec.scene).map(([key, val]) => {
        if (val.type === "selector") {
          return [key, { included: included(this.AssetsByType[key]) }];
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
        }
      }
    };
  },
  computed: {
    isBound() {
      return this.bound ? true : false;
    },
    isSelectable() {
      let result = this.selectable;
      if (typeof this.selectable !== "boolean") {
        result = true;

        if (
          this.selectable.filters.includes("condition") &&
          this.selectable.parent.scene !== this.index
        )
          result = false;

        if (this.selectable.selectionList.includes(this.scene.id))
          result = false;
      }

      return result;
    },
    validFieldNames() {
      return spec.sceneTypes[this.form.type];
    },
    ...mapGetters({
      assetSet: "assets/assetSet"
    }),
    AssetsByType() {
      return this.assetSet.reduce(
        (obj, asset) => (
          obj[asset.type]
            ? (obj[asset.type][asset.id] = asset)
            : (obj[asset.type] = { [asset.id]: asset }),
          obj
        ),
        {}
      );

      /*
      return this.assetSet.reduce(
        (obj, asset) => (
          obj[asset.type]
            ? obj[asset.type].push(asset.id)
            : (obj[asset.type] = [asset.id]),
          obj
        ),
        {}
      );
      */
    }
  },
  methods: {
    isType(field, type) {
      return spec.scene[field].type === type;
    },
    getIcon(field) {
      return spec.scene[field].icon || null;
    },
    ...mapActions({
      addScene: "scenario/addScene",
      removeScene: "scenario/removeScene",
      updateScene: "scenario/updateScene",
      unbindScene: "scenario/unbindScene"
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

.collapsing-counter .counter.is-invisible {
  display: none;
}

.absolute-counter .textarea {
  padding-bottom: calc(1.625em - 0.5625rem);
}

.absolute-counter > .textarea ~ .counter {
  position: absolute;
  right: 1em;
  bottom: 0.25em;
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

.center-card-content {
  @include flexCenter();
  height: 100%;
}

.bound-label {
  flex-grow: 1;
}
</style>
