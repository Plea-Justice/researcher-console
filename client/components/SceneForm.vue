<template>
  <ItemCard
    :collapsed="frameCollapsed"
    v-model="nameField"
    close
    :id="scene.id"
    @remove="removeScene($event)"
  >
    <!-- Body -->
    <template v-slot:default>
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

        <!-- FIXME: correctly v-model this property -->
        <p>Debug: {{ formData["name"] }}</p>

        <!-- Main Form -->
        <b-field v-for="field in validFields" :key="field">
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
  </ItemCard>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import ItemCard from "~/components/ItemCard";
import FileSelector from "~/components/FileSelector";
import ButtonInput from "~/components/ButtonInput";

// FIXME: formalize spec
import spec from "~/assets/spec.json";

export default {
  name: "SceneForm",
  components: { ItemCard, FileSelector, ButtonInput },
  props: {
    frameCollapsed: {
      type: Boolean,
      required: true
    },
    scene: {
      type: Object,
      required: true
    }
  },
  data() {
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
    //FIXME: use a computed property for this
    nameField: {
      get: function() {
        return { name: this.formData["name"].value };
      },
      set: function(newValue) {
        this.formData["name"].value = newValue;
      }
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
    }),
    onSubmit() {
      //FIXME: complete this or remove it
      console.log("Form Submitted");
    }
  }
};
</script>

<style scoped>
.toggle-button {
  justify-content: center !important;
}
</style>
