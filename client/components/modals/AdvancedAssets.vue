<template>
  <div class="modal-card" style="width: auto">
    <form @submit.prevent="onSubmit()">

      <header class="modal-card-head">
        <p class="modal-card-title">Condition {{ condition.index + 1 }} - Asset Customization</p>
      </header>

      <section class="modal-card-body">
        <div class="is-pulled-right">
          <b-button type="is-primary">
            Reset This Slot
          </b-button>
          <b-button type="is-primary">
            Reset All
          </b-button>
        </div>
        <b-tabs v-model="current" expanded>

          <template v-for="(slot, index) in slots">
            <b-tab-item :key="slot.id" :value="index" :label="index">

              <div v-if="index === 0" class="is-pulled-right">
                <b-field  class="has-text-small" horizontal>
                  <b-switch v-model="disableAvatar"/>
                </b-field>
              </div>

              Slot #{{index}} {{special[index] ? `(${special[index]})` : '' }}
              {{ slot }}

              <b-field >
                <b-field label="Figure" class="pr-3"
                  :message="figures[slot.figure]">
                  <b-numberinput
                    v-model="slot.figure"
                    size="is-small"
                    min="0"
                    :max="figures.length - 1"
                  />
                </b-field>
                <b-field label="Eyes" class="px-3"
                  :message="eyes[slot.eyes]">
                  <b-numberinput
                    v-model="slot.eyes"
                    size="is-small"
                    min="0"
                    :max="eyes.length - 1"
                  />
                </b-field>
                <b-field label="Hair" class="px-3"
                  :message="hair[slot.hair]">
                  <b-numberinput
                    v-model="slot.hair"
                    size="is-small"
                    min="0"
                    :max="hair.length - 1"
                  />
                </b-field>
              </b-field>

              <b-field label="Colors" >
                <template v-for="(color, index) in slot.colors">
                  <b-field :key="index" :message="colors[index]">
                    <b-input v-model="slot.colors[index]" size="is-small" placeholder="#ABCDEF" />
                  </b-field>
                </template>
              </b-field>

              <b-field label="Additional Layers (JSON)" >
                <b-field>
                  <b-input v-model="slot.custom" size="is-small" placeholder="{ layer: true, layer2: false }" />
                </b-field>
              </b-field>

            </b-tab-item>
          </template>
        </b-tabs>
      </section>

      <footer class="modal-card-foot">
        <b-button type="is-primary" native-type="submit" value="Save" expanded>
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

      hair: ['Style 1', 'Style 2', 'Style 3', 'Religious Headwear', 'None'],
      eyes: ['Style 1', 'Style 2', 'Style 3'],
      figures: ['Masculine Figure', 'Feminine Figure'],
      colors: ['Eyes', 'None', 'None', 'Hair', 'Outfit', 'Skin'],

      disableAvatar: true,

      optionsHelp: advancedAssetsHelp,
    };
  },
  methods: {

    onSubmit() {
      // TODO: Extra processing and validation will have to happen before saving
      // depending on the simulation format.
      // this.condition.customizations = this.slots;

      this.$parent.close();
    }
  }
};
</script>
