export default {
  data() {
    const Modes = {
      DEFAULT: 0,
      COPY: 1,
      BIND: 2,
      SWAP: 3
    };
    const modeNames = [];
    Object.entries(Modes).forEach(([key, val]) => (modeNames[val] = key.toLowerCase()));

    const Select = {
      NONE: 0,
      ANY: 1,
      SCENE: 2,
      CONDITION: 3
    };
    const selectNames = [];
    Object.entries(Select).forEach(([key, val]) => (selectNames[val] = key.toLowerCase()));

    const modeOptions = {
      [Modes.COPY]: {
        type: Select.ANY,
        filters: [],
        actions: {
          [Select.SCENE]: this.copyScenes,
          [Select.CONDITION]: this.copyConditions
        }
      },
      [Modes.BIND]: {
        type: Select.SCENE,
        filters: ['frame'],
        actions: {
          [Select.SCENE]: this.bindScenes
        }
      },
      [Modes.SWAP]: {
        type: Select.SCENE,
        max: 2,
        filters: ['condition'],
        actions: {
          [Select.SCENE]: this.swapScene
        }
      }
    };

    const modeSelectMessages = [
      {
        [Modes.COPY]: 'Select an element to copy from.',
        [Modes.BIND]: 'Select an element to bind to.',
        [Modes.SWAP]: 'Select a first element to swap.'
      },
      {
        [Modes.COPY]: 'Select elements to copy to.',
        [Modes.BIND]: 'Select elements to bind.',
        [Modes.SWAP]: 'Select a second element to swap with.'
      }
    ];

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
      modeSelectMessages,

      selectionCounter: 0,
      selectionList: []
    };
  },
  methods: {
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

        this.snackbar.message = this.modeSelectMessages[1][this.mode];
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
