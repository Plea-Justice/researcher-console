// Import VueX
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapActions } from 'vuex';

export default {
  data() {
    const Modes = {
      DEFAULT: 0,
      COPY: 1,
      BIND: 2,
      SWAP: 3
    };
    const modeNames = [];
    /*
      Guarantee key names are correctly ordered/
      Spec for Object.keys doesn't guarantee order even thought most browsers do order them
      This is critical to the implementation, so it's ensured manually
    */
    Object.entries(Modes).forEach(([key, val]) => (modeNames[val] = key.toLowerCase()));

    const Select = {
      NONE: 0,
      ANY: 1,
      SCENE: 2,
      CONDITION: 3
    };
    const selectNames = [];
    Object.entries(Select).forEach(([key, val]) => (selectNames[val] = key.toLowerCase()));

    /*
      **** Filters ****
      frame: preceding elements must be in the same frame
      condition: preceding elements must be in the same condition
      invalid: allows selecting invalid preceding elements (useful for copying to invalid scenes for instance)
    */

    // TODO: dynamically define type (as an array?) from action values?
    const modeOptions = {
      [Modes.COPY]: {
        type: Select.ANY,
        filters: ['invalid'],
        actions: {
          [Select.SCENE]: this.copyScenes,
          [Select.CONDITION]: this.copyConditions
        },
        // TODO: message would be better defined as { src: '', target: '' }
        messages: ['Select an element to copy from', 'Select element(s) to paste to']
      },
      [Modes.BIND]: {
        type: Select.SCENE,
        filters: ['frame', 'invalid'],
        actions: {
          [Select.SCENE]: this.bindScenes
        },
        messages: ['Select a scene to bind to', 'Select scene(s) to bind']
      },
      [Modes.SWAP]: {
        type: Select.SCENE,
        max: 2,
        filters: ['condition'],
        actions: {
          [Select.SCENE]: this.swapScene
        },
        messages: ['Select a scene to swap with', 'Select a scene in the same condition to swap with']
      }
    };

    return {
      // fallback for snackbar saving if removed from _id.vue
      snackbar: null,

      Modes,
      modeNames,
      // Set to initial
      mode: Modes.DEFAULT,

      Select,
      selectNames,
      // Set to initial
      select: Select.ANY,
      selectParent: null,
      modeOptions,

      selectionCounter: 0,
      selectionList: []
    };
  },
  methods: {
    ...mapActions({
      copyConditions: 'scenario/copyConditions',
      swapScene: 'scenario/swapScene',
      copyScenes: 'scenario/copyScenes',
      bindScenes: 'scenario/bindScenes'
    }),
    isSelectable(selectionType) {
      let result = false;
      if (this.mode !== this.Modes.DEFAULT && (this.select === this.Select.ANY || this.select === selectionType)) {
        // If parent is defined create filter
        result = this.selectParent
          ? {
              parent: this.selectParent,
              selectionList: this.selectionList,
              filters: this.modeOptions[this.mode].filters
            }
          : true;
      }
      return result;
    },
    selectionReset() {
      this.selectParent = null;
      this.selectionList = [];
      this.select = this.Select.NONE;
    },
    addToSelection(eventId, selectedType) {
      this.selectionList.push(eventId);
      const options = this.modeOptions[this.mode];
      const selectionLen = this.selectionList.length;

      // If first item
      if (selectionLen === 1) {
        // Update selection
        this.select = selectedType;
        this.selectParent =
          selectedType === this.Select.CONDITION
            ? eventId // condition id
            : this.findScene(this.selectionList[0]); // otherwise {frame, scene} index pair

        this.snackbar.message = this.modeOptions[this.mode].messages[1];
      } else if (
        (options.max && selectionLen >= options.max) ||
        (options.filters &&
          options.filters.includes('frame') &&
          selectionLen >= this.frameSet[this.selectParent.frame].scenes.length)
      ) {
        // If exceeds max selection property or has frame filter and selected all scenes in frame
        // then auto-end the selection process
        this.modeOptions[this.mode].actions[this.select](this.selectionList);
        this.closeSnackbar();
        this.mode = this.Modes.DEFAULT;
        this.selectionReset();
      } else if (this.selectionList.length === 2) {
        this.snackbar.actionText = 'Done';
        this.snackbar.type = 'is-info';
      }
    }
  }
};
