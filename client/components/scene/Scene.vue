<template>
  <ValidationObserver
    ref="form"
    tag="fieldset"
    class="flex-wrap"
    v-slot="{ failed }"
  >
    <GenericCard
      @remove="removeScene(scene.id)"
      :collapsed="collapsed"
      :focused="isBlank"
      :invalid="failed"
      close
    >
      <!-- Card Header -->
      <template v-slot:header>
        <!-- Scene Name -->

        <!-- FIXME: fix focus-input -->
        <BInputWithValidation
          ref="focus-input"
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
            >{{ type }}</b-radio-button
          >
        </b-field>

        <template v-for="field in validFieldNames">
          <FileSelector
            :key="field"
            v-if="isType(field, ['image', 'video'])"
            @input="updateSceneForm({ id: scene.id, key: field, val: $event })"
            :value="scene.props[field]"
            :values="AssetNamesByType[field + 's'] || []"
            :label="field"
            :icon="getIcon(field)"
          />

          <!-- FIXME: has-fixed-size -->
          <TextAreaWithValidation
            :key="field"
            v-if="isType(field, 'text')"
            rules="required"
            @input="updateSceneForm({ id: scene.id, key: field, val: $event })"
            :value="scene.props[field]"
            :label="field"
          />

          <ButtonInput
            v-if="isType(field, 'buttons')"
            @input="updateSceneForm({ id: scene.id, key: field, val: $event })"
            :value="scene.props[field]"
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
import ButtonInput from "~/components/scene/ButtonInput";

import BInputWithValidation from "~/components/inputs/BInputWithValidation";
import TextAreaWithValidation from "~/components/cards/TextAreaWithValidation";

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
    BInputWithValidation,
    TextAreaWithValidation
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
      let icon = null;
      if (type === "image") {
        ("file-image");
      } else if (type === "video") {
        ("file-video");
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

<style scoped>
.flex-wrap {
  display: flex;
  flex-grow: 1;
}

.toggle-button {
  justify-content: center !important;
}
</style>
