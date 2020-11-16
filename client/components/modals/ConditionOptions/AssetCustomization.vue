<template>
  <p v-if="!slots.length">No slots exists</p>

  <div v-else class="flex-fields">
    <b-field grouped>
      <b-field label="Slot">
        <b-select v-model="selectedSlotIndex">
          <option v-if="!slots.length" :value="null">None</option>
          <option v-for="(slot, index) in slots" :key="slot.id" :value="index">
            {{ index }}
          </option>
        </b-select>
      </b-field>

      <p class="control">
        <b-button type="is-primary" label="Reset This Slot" />
      </p>
      <p class="control">
        <b-button type="is-primary" label="Reset All Slots" />
      </p>

      <b-field label="Disable Avatar" class="has-text-small">
        <b-switch v-model="disableAvatar" />
      </b-field>
    </b-field>

    <div class="numberinputs">
      <b-field label="Figure" :message="figures[selectedSlot.figure]">
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

    <b-field
      v-for="(color, index) in selectedSlot.colors"
      :key="`${selectedSlot.id}:${index}:${colors[index]}`"
      :label="colors[index]"
    >
      <ColorInput v-model="selectedSlot.colors[index]" />
    </b-field>

    <b-field label="Additional Layers (JSON)">
      <b-input
        v-model="selectedSlot.custom"
        type="textarea"
        size="is-small"
        custom-class="has-fixed-size"
        placeholder="{ layer: true, layer2: false }"
        expanded
      />
    </b-field>
  </div>
</template>

<script>
import ColorInput from "~/components/form/ColorInput";

export default {
  components: { ColorInput },
  data() {
    // Initialize slots with the actor defaults.
    const slots = Array.from({ length: 10 }, (x, i) => ({
      id: i,
      modified: false,
      figure: 0,
      hair: 0,
      eyes: 0,
      colors: new Array(6).fill(""),
      custom: "",
    }));

    return {
      slots,
      selectedSlotIndex: slots.length ? 0 : null,
      disableAvatar: true,

      special: ["Avatar", "Judge", "Defense Attorney", "Prosecutor"],

      hair: ["Style 1", "Style 2", "Style 3", "Religious Headwear", "None"],
      eyes: ["Style 1", "Style 2", "Style 3"],
      figures: ["Masculine Figure", "Feminine Figure"],
      colors: ["Eyes", "None", "None", "Hair", "Outfit", "Skin"],
    };
  },
  computed: {
    selectedSlot() {
      return this.slots[this.selectedSlotIndex] || null;
    },
  },
};
</script>

<style scoped>
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
