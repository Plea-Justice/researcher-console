<template>
  <GenericCard @remove="removeScene(scene.id)" :collapsed="collapsed" :focused="isBlank" close>
    <!-- Card Header -->
    <template v-slot:header>
      <!-- Scene Name -->
      <b-input
        v-model="formData.name.value"
        ref="focus-input"
        placeholder="title"
        class="flex-grow"
      />
    </template>

    <template v-slot:default>
      <!-- FIXME: make form encompass everything -->
      <form @submit.prevent="onSubmit()">
        <!-- Scene Type Toggle -->
        <b-field class="is-capitalized toggle-button">
          <b-radio-button
            v-for="sceneType in validSceneTypes"
            :key="sceneType"
            :native-value="sceneType"
            v-model="selectedType"
          >{{ sceneType }}</b-radio-button>
        </b-field>

        <!-- Main Form -->
        <b-field v-for="field in validFields" :key="field" class="is-capitalized">
          <FileSelector
            v-if="formData[field].type == 'image' || formData[field].type == 'video'"
            v-model="formData[field].value"
            :fileNames="fieldNameByType[formData[field].key + 's'] || []"
            :placeholder="formData[field].key"
            :icon="getIcon(formData[field].type)"
          />

          <ButtonInput v-if="formData[field].type == 'buttons'" v-model="formData[field].value" />

          <textarea
            v-if="formData[field].type == 'text'"
            v-model="formData[field].value"
            class="textarea has-fixed-size"
            placeholder="script"
          />

          <!-- TODO: Display error for incorrect types/types that don't match anything ? -->
        </b-field>
      </form>
    </template>
  </GenericCard>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import GenericCard from "~/components/cards/GenericCard";
import FileSelector from "~/components/scene/FileSelector";
import ButtonInput from "~/components/scene/ButtonInput";

// FIXME: formalize spec
// FIXME: code-split import this
import spec from "~/assets/spec.json";

export default {
  name: "Scene",
  components: { GenericCard, FileSelector, ButtonInput },
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
    // TODO: use object syntax
    // FIXME: make formData stateful to wether component exists
    const sceneType = this.scene.props["type"];
    const validSceneTypes = Object.keys(spec.sceneTypes);

    // Defaults selected scene type to default if non exists
    const selectedType =
      sceneType && validSceneTypes.includes(sceneType)
        ? sceneType
        : validSceneTypes[0];

    const formData = Object.fromEntries(
      Object.entries(spec.scene).map(([key, val]) => [
        key,
        {
          key,
          type: val,
          value: this.scene.props[key] != "None" ? this.scene.props[key] : null
        }
      ])
    );

    return {
      validSceneTypes,
      selectedType,
      formData
    };
  },
  computed: {
    isBlank() {
      return this.scene.props == null;
    },
    validFields() {
      return spec.sceneTypes[this.selectedType];
    },
    ...mapGetters({
      assetSet: "assets/assetSet"
    }),
    fieldNameByType() {
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
    // TODO: make this a enum?
    getIcon(fileType) {
      let icon = null;
      if (fileType === "image") {
        ("file-image");
      } else if (fileType === "video") {
        ("file-video");
      }
      return icon;
    },
    ...mapActions({
      removeScene: "scenario/removeScene"
    })
  }
};
</script>

<style scoped>
.toggle-button {
  justify-content: center !important;
}
</style>
