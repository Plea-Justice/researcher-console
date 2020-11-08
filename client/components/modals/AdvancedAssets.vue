<template>
  <div class="modal-card">
    <form @submit.prevent="onSubmit()">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Condition {{ condition.index + 1 }} - Asset Customization
        </p>
      </header>
      <section class="modal-card-body">
        <b-tabs v-model="current" expanded multiline>
          <template v-for="(slot, index) in slots">
            <b-tab-item
              :key="slot.id"
              :value="index.toString()"
              :label="index.toString()"
            >
              <div class="buttons">
                <b-button type="is-primary">
                  Reset This Slot
                </b-button>
                <b-button type="is-primary">
                  Reset All Slots
                </b-button>
              </div>

              <div v-if="index === 0" class="is-pulled-right">
                <b-field class="has-text-small" horizontal>
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
                <b-field
                  v-for="(color, index) in slot.colors"
                  :key="index"
                  :message="colors[index]"
                >
                  <p class="control">
                    <b-button
                      :style="`background-color: red`"
                      size="is-small"
                      class="is-static"
                    />
                  </p>

                  <b-input
                    v-model="slot.colors[index]"
                    @focus="prefixHex(slot.colors, index)"
                    @blur="unprefixHex(slot.colors, index)"
                    size="is-small"
                    placeholder="#ABCDEF"
                  />
                </b-field>
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
        <b-button type="is-primary" native-type="submit" expanded>
          Done
        </b-button>
      </footer>
    </form>
  </div>
</template>

<script>
import HelpSidebar from "~/components/HelpSidebar";
import { helpers } from "vuelidate/lib/validators";
import { advancedAssetsHelp } from "~/assets/helpText";

export default {
  name: "AdvancedAssets",
  components: { HelpSidebar },
  props: {
    condition: {
      type: Object,
      required: true
    }
  },
  data() {
    // Initialize slots with the actor defaults.
    const slots = Array.from({ length: 10 }, (x, i) => ({
      id: i,
      modified: false,
      figure: 0,
      hair: 0,
      eyes: 0,
      colors: new Array(6).fill(""),
      custom: ""
    }));

    return {
      modified: false,
      current: 1,
      slots: slots,
      special: ["Avatar", "Judge", "Defense Attorney", "Prosecutor"],

      hair: ["Style 1", "Style 2", "Style 3", "Religious Headwear", "None"],
      eyes: ["Style 1", "Style 2", "Style 3"],
      figures: ["Masculine Figure", "Feminine Figure"],
      colors: ["Eyes", "None", "None", "Hair", "Outfit", "Skin"],

      disableAvatar: true,

      optionsHelp: advancedAssetsHelp
    };
  },
  methods: {
    onSubmit() {
      // TODO: Extra processing and validation will have to happen before saving
      // depending on the simulation format.
      // this.condition.customizations = this.slots;

      this.$parent.close();
    },
    prefixHex(colors, index) {
      if (!colors[index].length) colors.splice(index, 1, "#");
    },
    unprefixHex(colors, index) {
      if (colors[index].length === 1) colors.splice(index, 1, "");
    }
  }
};
</script>

<style>
.colors > .field-body > .field {
  display: flex;
  gap: 10px;
}
</style>

<style scoped>
/* FIXME: come up with a common style fix for cards */
.modal-card {
  width: auto;
  max-width: 90vw;
  margin-left: auto !important;
  margin-right: auto !important;
}

.numberinputs {
  display: flex;
  gap: 2rem;
}
</style>
