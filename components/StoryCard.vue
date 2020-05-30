<template>
  <!-- TODO: put parent in frame -->
  <!-- /* TODO: Use calculated value, based on max number of conditions visible defined by a media query */ -->

  <div :class="{ 'card-collapsed': isCollapsed }" class="tile is-child card has-radius-large">
    <form @submit.prevent="onSubmit()">
      <!-- Card Header -->
      <header
        :class="{ 'card-header-collapsed': isCollapsed }"
        class="card-header has-top-radius-large"
      >
        <div class="card-header-icon">
          <b-button @click="removeScene(scene.index)" type="is-danger" icon-right="close" />
        </div>

        <div class="card-header-title">
          <b-input v-model="formData[nameIndex].value" placeholder="name" />
        </div>

        <span class="card-header-icon">
          <b-button
            @click="collapse()"
            :icon-left="`chevron-${isCollapsed ? 'down' : 'up'}`"
            size="is-medium"
          />
        </span>
      </header>

      <!-- Card Body -->
      <div v-show="!isCollapsed" class="card-content">
        <p>{{ scene.index.frame }},{{ scene.index.scene }}</p>
        <!-- Scene Type Toggle -->
        <b-field class="toggle-button is-capitalized">
          <b-radio-button
            v-for="key in validSceneTypes"
            :key="key"
            :native-value="key"
            v-model="selectedType"
          >{{ key }}</b-radio-button>
        </b-field>

        <!-- Debug: formData output
          <p v-for="{ key, value } in formData" :key="key">{{ `${key}: ${value}` }}</p>
        -->

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
      </div>
    </form>

    <!-- Card Footer -->
    <footer v-show="!isCollapsed" class="card-footer">
      <!-- Form Submit Button -->
      <div class="card-footer-item footer-buttons-left">
        <b-button tag="input" native-type="submit" type="is-primary" value="Save" />
        <!-- TODO: Add last saved/auto save with button saving animation, disable button when fields aren't correct? -->
      </div>
      <div class="card-footer-item buttons flex-right">
        <b-button
          v-if="scene.index.frame != 0"
          size="is-large"
          icon-right="chevron-up"
          class="move-button"
          @click="moveSceneUp(scene.index)"
        />
        <b-button
          v-if="scene.index.frame != frameSize - 1"
          size="is-large"
          icon-right="chevron-down"
          class="move-button"
          @click="moveSceneDown(scene.index)"
        />
      </div>
    </footer>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import FileSelector from "~/components/FileSelector";
import ButtonInput from "~/components/ButtonInput";

export default {
  name: "StoryCard",
  components: { FileSelector, ButtonInput },
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
    const selfCollapsed = false;

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
      selfCollapsed,
      validSceneTypes,
      selectedType,
      formData,
      nameIndex
    };
  },
  computed: {
    isCollapsed() {
      return this.frameCollapsed || this.selfCollapsed;
    },
    validFields() {
      return this.formData.filter(({ key }) =>
        this.spec.sceneTypes[this.selectedType].includes(key)
      );
    },
    ...mapGetters({
      frameSize: "scenes/frameSize"
    })
  },
  methods: {
    collapse() {
      if (!this.frameCollapsed) this.selfCollapsed = !this.selfCollapsed;
    },
    onSubmit() {
      console.log("Form Submitted");
    },
    ...mapActions({
      moveSceneUp: "scenes/moveSceneUp",
      moveSceneDown: "scenes/moveSceneDown",
      removeScene: "scenes/removeScene"
    }),
    async getAsset(assetName) {
      console.log(assetName);
      const { name, ...b } = assetName;
      console.log("a: " + name);
      console.log("b: " + b);

      const asset =
        assetName != "None"
          ? await this.$axios.$get(`/assets/${assetName}`)
          : "Error: asset is 'None' or missing asset field exists";
      return asset;
    }
  }
};
</script>

<style scoped>
/* Fix for card footer */
.tile.is-child.card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* FIXME: use Bulma SASS $radius-large variable */
.has-radius-large {
  border-radius: 6px;
}

.card-collapsed {
  box-shadow: none;
  -webkit-box-shadow: none;
}

/* FIXME: reference .has-radius-large class */
.card-header-collapsed {
  border-radius: 6px; /* Should follow .has-radius-large class */
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  -webkit-box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1),
    0 0 0 1px rgba(10, 10, 10, 0.1);
}

.toggle-button {
  justify-content: center !important;
}

.footer-buttons-left {
  justify-content: flex-start !important;
  border: none;
}

.flex-right {
  justify-content: flex-end !important;
}

.move-button {
  font-size: unset;
  border: none;
}
</style>
