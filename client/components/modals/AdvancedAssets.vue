<template>
  <div class="modal-card">
    <form @submit.prevent="onSubmit()">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Condition {{ condition.index + 1 }} - Asset Customization
        </p>
        <div class="buttons">
          <b-button type="is-primary"> Reset This Slot </b-button>
          <b-button type="is-primary"> Reset All Slots </b-button>
        </div>
      </header>
      <section class="modal-card-body">
        <b-field label="Slot" horizontal>
          <b-select>
            <option v-for="(slot, index) in slots" :key="index" :value="index">
              {{ index }}
            </option>
          </b-select>
        </b-field>

        <b-tabs v-model="current" expanded multiline>
          <template v-for="(slot, index) in slots">
            <b-tab-item
              :key="slot.id"
              :value="index.toString()"
              :label="index.toString()"
            >
              <div v-if="index === 0" class="is-pulled-right">
                <b-field
                  label="Preset Avatar"
                  class="has-text-small"
                  horizontal
                >
                  <b-switch v-model="disableAvatar" />
                </b-field>
              </div>

              Slot #{{ index }}
              {{ special[index] ? `(${special[index]})` : "" }}
              {{ slot }}

              <div class="numberinputs">
                <b-field label="Figure" :message="figures[slot.figure]">
                  <b-numberinput
                    v-model="slot.figure"
                    size="is-small"
                    min="0"
                    :max="figures.length - 1"
                    controls-position="compact"
                  />
                </b-field>
                <b-field label="Eyes" :message="eyes[slot.eyes]">
                  <b-numberinput
                    v-model="slot.eyes"
                    size="is-small"
                    min="0"
                    :max="eyes.length - 1"
                    controls-position="compact"
                  />
                </b-field>
                <b-field label="Hair" :message="hair[slot.hair]">
                  <b-numberinput
                    v-model="slot.hair"
                    size="is-small"
                    min="0"
                    :max="hair.length - 1"
                    controls-position="compact"
                  />
                </b-field>
              </div>

              <b-field label="Colors" class="colors">
                <ColorInput
                  v-for="(color, index) in slot.colors"
                  :key="index"
                  v-model="slot.colors[index]"
                  :message="colors[index]"
                  size="is-medium"
                  placeholder="#ffffff"
                />
              </b-field>

              <b-field label="Additional Layers (JSON)">
                <b-field>
                  <b-input
                    v-model="slot.custom"
                    size="is-small"
                    placeholder="{ layer: true, layer2: false }"
                  />
                </b-field>
              </b-field>
            </b-tab-item>
          </template>
        </b-tabs>
      </section>

      <footer class="modal-card-foot">
        <b-button
          label="Done"
          type="is-primary"
          native-type="submit"
          expanded
        />
      </footer>
    </form>
  </div>
</template>

<script>
// Import Components
import ColorInput from "~/components/form/ColorInput";

export default {
  name: "AdvancedAssets",
  components: { ColorInput },
  props: {
    condition: {
      type: Object,
      required: true,
    },
  },
  data() {
    // Initialize slots with the actor defaults.
    const init = () =>
      Array.from({ length: 10 }, (x, i) => ({
        id: i,
        modified: false,
        figure: 0,
        hair: 0,
        eyes: 0,
        colors: new Array(6).fill(""),
        custom: "",
      }));

    return {
      modified: false,
      current: 1,
      slots: init(),
      special: ["Avatar", "Judge", "Defense Attorney", "Prosecutor"],

      hair: ["Style 1", "Style 2", "Style 3", "Religious Headwear", "None"],
      eyes: ["Style 1", "Style 2", "Style 3"],
      figures: ["Masculine Figure", "Feminine Figure"],
      colors: ["Eyes", "None", "None", "Hair", "Outfit", "Skin"],

      disableAvatar: true,
    };
  },
  watch: {
    slots: {
      handler: function (v) {
        this.modified = true;
      },
      deep: true,
    },
  },
  methods: {
    onSubmit() {
      // TODO: Extra processing and validation will have to happen before saving
      // depending on the simulation format.
      // this.condition.customizations = this.slots;

      this.$parent.close();
    },
  },
};
</script>

<style>
.colors > .field-body > .field {
  display: flex;
  gap: 10px;
}
</style>

<style lang="scss" scoped>
/* FIXME: come up with a common style fix for cards */
.modal-card {
  width: auto;
  max-width: 90vw;
  max-height: 90vh;
  margin-left: auto !important;
  margin-right: auto !important;

  & > .modal-card-body {
    //FIXME: set max-height
  }
}

.numberinputs {
  display: flex;
  gap: 2rem;
}
</style>
