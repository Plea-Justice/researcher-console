<template>
  <form @submit.prevent="onSubmit()" class="modal-card" style="width: 80vw;">
    <header class="modal-card-head">
      <p class="modal-card-title">
        Condition {{ index + 1 }} - Asset Customization
      </p>
    </header>
    <section class="modal-card-body">
      <span><i>This is an experimental feature. Check back later.</i></span>
      <b-tabs  v-if="selectedSlot && Object.keys(customizableSlots).length" v-model="selectedSlotIndex" expanded multiline>
        <template v-for="(slot, index) in customizableSlots">
          <b-tab-item :key="index" :value="index.toString()">
            <template v-slot:header>
              <span>Slot {{ index }} {{ special.slots[index] ? `(${special.slots[index]})` : ''}}</span>
            </template>

            <p class="mb-3" v-if="selectedSlotIndex == 0"><i>By default, customization slot 0
              is allocated to the participant-avatar. This slot allows you to
              override the default avatar appearance. Changes made by the
              participant will take precedent over the changes made here if
              the avatar customization screen is enabled for this scenario.</i></p>

            <span class="is-size-7 is-flex is-flex-direction-row">
              <p class="my-1 mr-2">Used by assets:</p>
              <b-taglist class="is-flex-grow-5">
                <b-tag v-for="asset in slot.assets" :key="asset">{{
                  asset
                }}</b-tag>
              </b-taglist>
              <b-tooltip position="is-left" label="Reset all customizations in this slot to the defaults.">
                <b-button class="is-small" type="is-primary"
                  @click="resetCurrentSlot">
                  Reset This Slot
                </b-button>
              </b-tooltip>
            </span>

            <div class="flex-fields">

              <div v-if="slot.feature.length > 0">
                <h2 class="subtitle">Features</h2>
                <b-field grouped group-multiline class="numberinputs">
                  <b-field v-for="feature in slot.feature" :key="feature.name"
                    :label="feature.name | capitalize"
                    :message="special[feature.name][selectedSlot[feature.name]]">
                    <b-numberinput
                      v-model="selectedSlot[feature.name]"
                      size="is-small"
                      min="0"
                      :max="feature.range - 1"
                      controls-position="compact"
                    />
                  </b-field>
                </b-field>
              </div>

              <div v-if="slot.colors.length > 0">
                <h2 class="subtitle">Colors</h2>
                <b-field grouped group-multiline>
                  <b-field
                    v-for="colorfield in slot.colors"
                    :key="colorfield.color"
                    :label="colorfield.name"
                  >
                    <ColorInput
                      v-model="selectedSlot.colors[colorfield.color]"
                    />
                  </b-field>
                </b-field>
              </div>

              <!-- TODO: Implement toggleable and numbered layer customizables. -->

              </div>
            </div>
          </b-tab-item>
        </template>
      </b-tabs>
      <p v-else> No assets selected. Navigate to the options menu and select assets for this scenario.</p>
      <p v-if="env.MODE === 'development'">
          <span>{{customizableSlots}}</span>
          <pre>{{ slots }}</pre>
      </p>
    </section>

    <footer class="modal-card-foot">
      <b-button label="Done" type="is-primary" native-type="submit" expanded />
    </footer>
  </form>
</template>

<script>
// vuex
import { mapGetters } from "vuex";

// Import Components
import ColorInput from "~/components/form/ColorInput";

export default {
  name: "AdvancedAssets",
  components: { ColorInput },
  props: {
    index: {
      type: Number,
      required: true
    },
    condition: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      modified: false,
      slots: [],
      selectedSlotIndex: 0,

      special: {
        slots: ["Avatar", "Judge", "Defense Attorney", "Prosecutor"],
        hair: ["Style 1", "Style 2", "Style 3", "Religious Headwear", "None"],
        eyes: ["Style 1", "Style 2", "Style 3"],
        figure: ["Masculine Figure", "Feminine Figure"],
        colors: ["Eyes", "None", "None", "Hair", "Outfit", "Skin"]
      },
      
      disableAvatar: true,
      env: { MODE: process.env.MODE }
    };
  },
  computed: {
    ...mapGetters({
      scenarioAssetList: "scenario/assetList",
      assets: "assets/assets"
    }),
    // The list of assets for this scenario which can be customized.
    customizableAssets() {
      return this.scenarioAssetList.reduce(
        (acc, id) =>
          this.assets[id].customizables?.length > 0
            ? acc.concat([this.assets[id]])
            : acc,
        []
      );
    },
    // The reduced set of customization slots for the asset list.
    customizableSlots() {
      const availableSlots = {};

      const add = (map, obj) => {
        if (!map.has(obj.name)) map.set(obj.name, obj);
      };

      // Determine which customization availableSlots to show.
      const customizables = this.customizableAssets.reduce((acc, asset) => {

        // For each customizable used by the asset...
        asset.customizables.forEach(cstm => {

          // Initialize the slot if it hasn't already been initialized.
          if (!availableSlots[cstm.slot])
            availableSlots[cstm.slot] = {
              // List of assets utilizing this slot.
              assets: new Set(),
              // List of customizable colors in this slot.
              colors: new Map(),
              // List of customizable features in this slot.
              feature: new Map(),
              // Lists of custom layers in this slot.
              toggleable: new Map(),
              numbered: new Map()
            };

          // Add the asset to the list of assets which use the slot.
          availableSlots[cstm.slot].assets.add(asset.name);

          // Store additional information for certain customizable's.
          switch (cstm.type) {
            case "color":
              add(availableSlots[cstm.slot].colors, {
                name: cstm.name,
                color: cstm.color
              });
              break;
            case "feature":
            case "toggleable":
            case "numbered":
              add(availableSlots[cstm.slot][cstm.type], {
                name: cstm.name,
                range: cstm.range
              });
              break;
            default:
          }
        });

        return acc.concat(asset.customizables);
      }, []);

      Object.values(availableSlots).forEach(slot => {
        slot.assets = [...slot.assets.values()];
        slot.colors = [...slot.colors.values()].sort((x, y) => x.color > y.color);
        slot.feature = [...slot.feature.values()];
        slot.toggleable = [...slot.toggleable.values()];
        slot.numbered = [...slot.numbered.values()];
      });

      return availableSlots;
    },
    selectedSlot() {
      return this.slots[this.selectedSlotIndex] || null;
    }
  },
  mounted: function(){
    this.slots = Array.from({ length: 6 }, (x, i) => this.init_slot(i));
  },
  methods: {
    init_slot(i) {
      return {
        id: i,
        figure: 0,
        hair: 0,
        eyes: 0,
        colors: new Array(6).fill(""),
        // numbered: this.customizableAssets[i]?.numbered ? this.customizableAssets[i].numbered.reduce(
        //   (acc, item) => {acc[item.name] = 0, acc}, {}
        // ) : {},
        // toggle: []
      }
    },
    resetCurrentSlot() {
      this.$set(this.slots, this.selectedSlotIndex,this.init_slot(this.selectedSlotIndex));
    },
    onSubmit() {
      // TODO: Extra processing and validation will have to happen before saving
      // depending on the simulation format.
      // this.condition.customizations = this.slots;

      this.$parent.close();
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

<style lang="scss" scoped>
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
