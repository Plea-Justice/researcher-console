<template>
  <div class="modal-card">
    <form @submit.prevent="onSubmit()">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Condition {{ index + 1 }} - Asset Customization
        </p>
        <div class="buttons">
          <b-button type="is-primary"> Reset This Slot </b-button>
          <b-button type="is-primary"> Reset All Slots </b-button>
        </div>
      </header>
      <section class="modal-card-body">
        <b-tabs v-model="selectedSlotIndex" expanded multiline>
          <template v-for="(slot, index) in slots">
            <b-tab-item
              :key="slot.id"
              :value="index.toString()"
              :label="index.toString() + (special[index] ? ` (${special[index]})` : '')"
            >
              <div class="flex-fields">
                <div class="numberinputs">
                  <b-field
                    label="Figure"
                    :message="figures[selectedSlot.figure]"
                  >
                    <b-numberinput
                      v-model="selectedSlot.figure"
                      size="is-small"
                      min="0"
                      :max="figures.length - 1"
                      controls-position="compact"
                    />
                  </b-field>
                  <b-field label="Eyes" :message="eyes[selectedSlot.eyes]">
                    <b-numberinput
                      v-model="selectedSlot.eyes"
                      size="is-small"
                      min="0"
                      :max="eyes.length - 1"
                      controls-position="compact"
                    />
                  </b-field>
                  <b-field label="Hair" :message="hair[selectedSlot.hair]">
                    <b-numberinput
                      v-model="selectedSlot.hair"
                      size="is-small"
                      min="0"
                      :max="hair.length - 1"
                      controls-position="compact"
                    />
                  </b-field>
                </div>

                <div>
                  <h2 class="subtitle">Colors</h2>
                  <b-field grouped group-multiline>
                    <b-field
                      v-for="(color, index) in selectedSlot.colors"
                      :key="`${selectedSlot.id}:${index}:${colors[index]}`"
                      :label="colors[index]"
                    >
                      <ColorInput v-model="selectedSlot.colors[index]" />
                    </b-field>
                  </b-field>
                </div>

                <b-field label="Additional Layers (JSON)">
                  <b-input
                    v-model="selectedSlot.custom"
                    type="textarea"
                    size="is-small"
                    custom-class="has-fixed-size"
                    placeholder="{ layer: true, layer2: false }"
                  />
                </b-field>
              </div>
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
    index: {
      type: Number,
      required: true,
    },
    condition: {
      type: Object,
      required: true,
    },
  },
  data() {
    // Initialize slots with the actor defaults.
    const init = () =>
      Array.from({ length: 5 }, (x, i) => ({
        id: i,
        modified: false,
        figure: 0,
        hair: 0,
        eyes: 0,
        colors: new Array(6).fill(""),
        custom: "",
      }));
    const slots = init();

    return {
      modified: false,
      slots: slots,
      selectedSlotIndex: slots.length ? 0 : null,
      special: ["Avatar", "Judge", "Defense Attorney", "Prosecutor"],

      hair: ["Style 1", "Style 2", "Style 3", "Religious Headwear", "None"],
      eyes: ["Style 1", "Style 2", "Style 3"],
      figures: ["Masculine Figure", "Feminine Figure"],
      colors: ["Eyes", "None", "None", "Hair", "Outfit", "Skin"],

      disableAvatar: true,
    };
  },
  watch: {
    // slots: {
    //   handler: function (v) {
    //     this.modified = true;
    //   },
    //   deep: true,
    // },
  },
  computed: {
    selectedSlot() {
      return this.slots[this.selectedSlotIndex] || null;
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

.flex-fields {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.numberinputs {
  display: flex;
  gap: 2rem;
}
</style>
