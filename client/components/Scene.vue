<template>
  <ValidationObserver ref="form" tag="fieldset" class="flex-wrap" v-slot="{ failed }">
    <div
      v-if="selectable && failed"
      @click="invalidSelectionToast"
      class="invalid-selection-wrapper"
    />
    <GenericCard
      @remove="removeScene(scene.id)"
      @selected="$emit('selected', scene.id)"
      :selection="selectable && !failed"
      :collapsed="collapsed"
      :focused="isBlank"
      :invalid="failed"
      close
    >
      <!-- Card Header -->
      <template v-slot:header>
        <!-- Scene Name -->
        <BInputWithValidation
          ref="focus_target"
          rules="required|alpha_spaces"
          @input="updateForm(scene.id, 'name', $event)"
          :value="scene.props.name"
          name="Scene Name"
          placeholder="Scene Name"
          class="flex-grow"
        />
      </template>

      <template v-slot:default>
        <!-- Scene Type Toggle -->
        <b-field class="is-capitalized toggle-button">
          <b-radio-button
            v-for="type in validSceneTypes"
            :key="type"
            @input="updateSceneForm({ id: scene.id, key: 'type', val: $event })"
            :value="scene.props.type"
            :native-value="type"
          >{{ type }}</b-radio-button>
        </b-field>

        <template v-for="field in validFieldNames">
          <FileSelector
            :key="field"
            v-if="isType(field, ['image', 'video'])"
            @input="updateSceneForm({ id: scene.id, key: field, val: $event })"
            :value="scene.props[field]"
            :options="AssetNamesByType[field + 's'] || []"
            :label="field | capitalize"
            :icon="getIcon(field)"
            custom-class="is-capitalized"
          />

          <!-- FIXME: has-fixed-size -->
          <BInputWithValidation
            :key="field"
            v-if="isType(field, 'text')"
            type="textarea"
            rules="required|max:220"
            @input="updateSceneForm({ id: scene.id, key: field, val: $event })"
            :value="scene.props[field]"
            :label="field | capitalize"
            custom-class="has-fixed-size"
          />

          <ButtonInput
            :key="field"
            v-if="isType(field, 'buttons')"
            @input="updateSceneForm({ id: scene.id, key: field, val: $event })"
            :value="scene.props[field]"
            :label="field | capitalize"
            custom-class="is-capitalized"
          />

          <!-- TODO: Display error for incorrect types/types that don't match anything ? -->
        </template>
      </template>
    </GenericCard>
  </ValidationObserver>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import { ValidationObserver } from "vee-validate";

import GenericCard from "~/components/cards/GenericCard";
import FileSelector from "~/components/inputs/FileSelector";
import ButtonInput from "~/components/inputs/ButtonInput";

import BInputWithValidation from "~/components/inputs/BInputWithValidation";

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
    ButtonInput,
    BInputWithValidation
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
    }
  },
  data() {
    return {
      validSceneTypes: Object.keys(spec.sceneTypes)
    };
  },
  computed: {
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
    invalidSelectionToast() {
      this.$buefy.toast.open({
        message: "Can't select an invalid scene, correct scene first.",
        type: "is-danger"
      });
    },
    // Method accessible by $refs from Parent for focus event
    focus() {
      this.$refs.focus_target.focus();
    },
    validationScheduler: debounce(function() {
      this.$refs.form
        .validate()
        .then(success =>
          success
            ? this.setSceneValid(this.scene.id)
            : this.setSceneInvalid(this.scene.id)
        );
    }, 350),
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
      setSceneInvalid: "scenario/setSceneInvalid",
      setSceneValid: "scenario/setSceneValid",
      updateSceneType: "scenario/updateSceneType",
      updateSceneForm: "scenario/updateSceneForm"
    }),
    updateForm(id, key, val) {
      // TODO: change order of these, validate on update?
      this.updateSceneForm({ id, key, val });
      this.validationScheduler();
    }
  }
};
</script>

<style lang="scss" scoped>
.flex-wrap {
  position: relative;
  display: flex;
  flex-grow: 1;
}

.invalid-selection-wrapper {
  // FIXME: Make wrappers (masks) extendable classes
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 5;
  cursor: pointer;
  background-color: #ff443a99;
  // FIXME: use Bulma SASS $radius-large variable
  // Use mixin of .has-radius-large instead
  border-radius: 6px;
}

.card {
  height: 100%;
}

.toggle-button {
  justify-content: center !important;
}
</style>
