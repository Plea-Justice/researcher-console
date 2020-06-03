<template>
  <StoryCard :frameCollapsed="frameCollapsed">
    <!-- Header -->
    <template v-slot:header>
      <div class="card-header-title">
        <b-input v-model="formData[nameIndex].value" placeholder="name" />
      </div>
    </template>

    <!-- Body -->
    <template v-slot:default>
      <form @submit.prevent="onSubmit()">
        <!-- Debug: formData output
          <p v-for="{ key, value } in formData" :key="key">{{ `${key}: ${value}` }}</p>
        -->

        <!-- Scene Type Toggle -->
        <b-field class="toggle-button is-capitalized">
          <b-radio-button
            v-for="key in validSceneTypes"
            :key="key"
            :native-value="key"
            v-model="selectedType"
          >{{ key }}</b-radio-button>
        </b-field>

        <!-- Main Form -->
        <b-field v-for="asset in validFields" :key="asset.key">
          <FileSelector
            v-if="asset.type == 'image'"
            :assetType="asset.key"
            icon="file-image"
            v-model="asset.value"
            :manifest="manifest"
          />

          <FileSelector
            v-if="asset.type == 'video'"
            :assetType="asset.key"
            icon="file-video"
            v-model="asset.value"
            :manifest="manifest"
          />

          <textarea
            v-if="asset.type == 'text'"
            v-model="asset.value"
            class="textarea has-fixed-size"
            placeholder="script"
          />

          <ButtonInput v-if="asset.type == 'buttons'" v-model="asset.value" />

          <!-- TODO: Display error for incorrect types/types that don't match anything -->
        </b-field>
      </form>
    </template>

    <!-- Footer -->
    <template v-slot:footer>
      <!-- Form Submit Button -->
      <div class="card-footer-item buttons footer-buttons-left">
        <b-button @click="removeScene(scene.index)" type="is-danger" icon-right="close" />
        <b-button tag="input" native-type="submit" type="is-primary" value="Save" />
        <!-- TODO: Add last saved/auto save with button saving animation, disable button when fields aren't correct? -->
      </div>

      <!-- Move Up/Down Buttons -->
      <div class="card-footer-item buttons flex-right">
        <b-button
          v-if="!isFirst"
          size="is-large"
          icon-right="chevron-up"
          class="move-button"
          @click="moveSceneUp(scene.index)"
        />
        <b-button
          v-if="!isLast"
          size="is-large"
          icon-right="chevron-down"
          class="move-button"
          @click="moveSceneDown(scene.index)"
        />
      </div>
    </template>
  </StoryCard>
</template>

<script>
// Import VueX
import { mapGetters, mapActions } from "vuex";

// Import Components
import StoryCard from "~/components/StoryCard";
import FileSelector from "~/components/FileSelector";
import ButtonInput from "~/components/ButtonInput";

export default {
  name: "StoryForm",
  components: { StoryCard, FileSelector, ButtonInput },
  props: {
    scene: {
      type: Object,
      required: true
    },
    frameCollapsed: {
      type: Boolean,
      required: true
    },
    spec: {
      type: Object,
      required: true
    },
    manifest: {
      type: Object,
      required: true
    }
  },
  data() {
    const sceneType = this.scene.props["type"];
    const validSceneTypes = Object.keys(this.spec.sceneTypes);

    // Defaults Scene type selection toggle to the first one that is defines in ~/data/spec.json
    const selectedType =
      sceneType && validSceneTypes.includes(sceneType)
        ? sceneType
        : validSceneTypes[0];

    // TODO: add name as an excluded type and update this elsewhere so it is consistent
    // TODO: make props compatible with array or single values
    const formData = Object.entries(this.spec.scene).map(([key, value]) => ({
      key: key,
      type: value,
      value: this.scene.props[key] != "None" ? this.scene.props[key] : null
    }));

    const nameIndex = formData.findIndex(obj => obj.key == "name");

    return {
      validSceneTypes,
      selectedType,
      formData,
      nameIndex
    };
  },
  computed: {
    validFields() {
      return this.formData.filter(({ key }) =>
        this.spec.sceneTypes[this.selectedType].includes(key)
      );
    },
    ...mapGetters({
      isMoveableScene: "scenes/isMoveableScene",
      getisFirst: "scenes/isFirst",
      getisLast: "scenes/isLast"
    }),
    isFirst() {
      return this.getisFirst(this.scene.index.frame);
    },
    isLast() {
      return this.getisLast(this.scene.index);
    }
  },
  methods: {
    onSubmit() {
      console.log("Form Submitted");
    },
    ...mapActions({
      moveSceneUp: "scenes/moveSceneUp",
      moveSceneDown: "scenes/moveSceneDown",
      removeScene: "scenes/removeScene"
    })
  }
};
</script>

<style scoped>
.toggle-button {
  justify-content: center !important;
}

.footer-buttons-left {
  justify-content: flex-start !important;
  border: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

.flex-right {
  justify-content: flex-end !important;
}

.move-button {
  font-size: unset;
  border: none;
}
</style>
