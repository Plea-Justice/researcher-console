<template>
  <form @submit.prevent="onSubmit()" class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">
        Condition {{ index + 1 }} - Asset Customization
      </p>
    </header>
    <section class="modal-card-body">
      <i>This is an experimental feature. Check back later.</i>
      <b-tabs v-model="selectedSlotIndex" expanded multiline>
        <template v-for="(slot, index) in customizableSlots">
          <b-tab-item :key="index" :value="index.toString()">
            <template v-slot:header>
              <span>Slot #{{ index }}</span>
            </template>

            <b-button class="is-small is-pulled-right" type="is-primary">
              Reset This Slot
            </b-button>

            <div class="is-size-7">
              <p class="mb-1">Used by assets:</p>
              <b-taglist>
                <b-tag v-for="asset in slot.assets" :key="asset">{{
                  asset
                }}</b-tag>
              </b-taglist>
            </div>

            <div class="flex-fields">

              <div v-if="slot.feature.length > 0" class="numberinputs">
                <h2 class="subtitle">Features</h2>
                <b-field
                  v-for="feature in slot.feature"
                  :key="feature"
                  :label="feature.name | capitalize"
                >
                  <b-numberinput
                    v-model="selectedSlot.figure"
                    size="is-small"
                    min="0"
                    :max="feature.range - 1"
                    controls-position="compact"
                  />
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

              <div v-if="slot.toggleable.length > 0">
                <h2 class="subtitle">Toggleable Layers</h2>
                <b-field grouped group-multiline>
                  <b-field
                    v-for="colorfield in slot.toggleable"
                    :key="colorfield.color"
                    :label="colorfield.name"
                  >
                    <b-switch></b-switch>
                  </b-field>
                </b-field>
              </div>

              <div v-if="slot.numbered.length > 0" class="numberinputs">
                <h2 class="subtitle">Selectable Layers</h2>
                <b-field
                  v-for="layer in slot.numbered"
                  :key="layer"
                  :label="layer.name | capitalize"
                >
                  <b-numberinput
                    size="is-small"
                    min="0"
                    :max="layer.range - 1"
                    controls-position="compact"
                  />
                </b-field>
              </div>
            </div>
          </b-tab-item>
        </template>
      </b-tabs>
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
    // Initialize slots with the actor defaults.
    const init = () =>
      Array.from({ length: 5 }, (x, i) => ({
        id: i,
        modified: false,
        figure: 0,
        hair: 0,
        eyes: 0,
        colors: new Array(6).fill(""),
        custom: ""
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

      disableAvatar: true
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
      const slots = {};

      const add = (map, obj)=>{
        if (!map.has(obj.name))
          map.set(obj.name, obj);
      }

      const customizables = this.customizableAssets.reduce((acc, asset) => {
        asset.customizables.forEach(obj => {
          if (!slots[obj.slot])
            slots[obj.slot] = {
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

          slots[obj.slot].assets.add(asset.name);
          switch (obj.type) {
            case "color":
              add(slots[obj.slot].colors, { name: obj.name, color: obj.color });
              break;
            case "feature":
            case "toggleable":
            case "numbered":
              add(slots[obj.slot][obj.type], {
                name: obj.name,
                range: obj.range
              });
              break;
            default:
          }
        });

        return acc.concat(asset.customizables);
      }, []);

      Object.values(slots).forEach(
        slot => {
          slot.assets = [...slot.assets.values()];
          slot.colors = [...slot.colors.values()];
          slot.feature = [...slot.feature.values()];
          slot.toggleable = [...slot.toggleable.values()];
          slot.numbered = [...slot.numbered.values()];
        }
      );

      return slots;
    },
    selectedSlot() {
      return this.slots[this.selectedSlotIndex] || null;
    }
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
