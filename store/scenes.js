export const state = () => ({
  conditionLengths: [],
  frames: [],
  idCounter: 1
});

export const getters = {
  // General
  numConditions: state => state.conditionLengths.length,
  frames: state => state.frames,

  // Frame & Scene
  isFirst: state => index =>
    typeof index === 'object'
      ? index.frame === 0 // Scene
      : index === 0, // Frame
  isLast: state => index =>
    typeof index === 'object'
      ? index.frame === state.conditionLengths[index.scene] - 1 // Scene
      : index === state.frames.length - 1, // Frame

  // Scene
  isBlank: state => index => state.frames[index.frame].scenes[index.scene].props == null
};

export const actions = {
  async getExperiment({ commit }) {
    const response = await this.$axios.$get('/experiment.json');

    commit('setConditionLengths', response);
    commit('setFrames', response);
  },
  addCondition({ commit }, scene) {
    // <!-- FIXME: Handle what is used as a new scene more reliably -->
    commit('newCondition', scene);
  },
  removeCondition({ commit }, index) {
    commit('deleteCondition', index);
  },
  addScene({ commit }, { index, scene }) {
    // <!-- FIXME: Handle what is used as a new scene more reliably -->
    commit('newScene', { index: { scene: index.scene, frame: index.frame + 1 }, scene });
  },
  removeScene({ commit }, index) {
    commit('deleteScene', index);
  },
  moveFrameUp({ commit }, frameIndex) {
    commit('moveFrame', { fromIndex: frameIndex, toIndex: frameIndex - 1 });
  },
  moveFrameDown({ commit }, frameIndex) {
    commit('moveFrame', { fromIndex: frameIndex, toIndex: frameIndex + 1 });
  },
  moveSceneUp({ commit }, index) {
    commit('moveScene', { sceneIndex: index.scene, fromIndex: index.frame, toIndex: index.frame - 1 });
  },
  moveSceneDown({ commit }, index) {
    commit('moveScene', { sceneIndex: index.scene, fromIndex: index.frame, toIndex: index.frame + 1 });
  }
};

export const mutations = {
  setConditionLengths(state, conditions) {
    state.conditionLengths = conditions.map(condition => condition.scenes.length);
  },
  setFrames(state, conditions) {
    const maxColLength = state.conditionLengths.reduce((a, b) => Math.max(a, b));

    // TODO: improve this to use maps instead
    const arr = [];
    for (let i = 0; i < maxColLength; i++) {
      const arr2 = [];
      for (let j = 0; j < conditions.length; j++) {
        if (conditions[j].scenes[i]) {
          arr2.push({
            id: state.idCounter,
            index: { scene: j, frame: i },
            props: conditions[j].scenes[i]
          });
          state.idCounter += 1;
        }
      }
      arr.push({ index: i, scenes: arr2 });
    }

    state.frames = arr;
  },
  newCondition: (state, scene) => {
    const newIndex = state.conditionLengths.length;

    // Add condition name and first empty scene to condition
    // TODO: have formal condition name format
    state.frames[0].scenes.push({
      id: state.idCounter,
      index: { scene: newIndex, frame: 0 },
      props: scene
    });
    state.idCounter += 1;

    // Adjust ConditionLengths to have a new condition
    state.conditionLengths.push(1);
  },
  deleteCondition: (state, conditionIndex) => {
    // Remove conditionLength
    const sceneIndex = state.conditionLengths.splice(conditionIndex, 1);

    // Remove all scenes for that condition
    for (let i = 0; i < sceneIndex; i++) state.frames[i].scenes.splice(conditionIndex, 1);
  },
  newScene: (state, { index, scene }) => {
    function fillBlankScenes(frameIndex) {
      // Fill gaps with blank scenes
      const frameLength = state.frames[frameIndex].scenes.length;
      for (let i = frameLength; i < index.scene; i++) {
        state.frames[frameIndex].scenes.push({
          id: state.idCounter,
          index: { scene: i, frame: frameIndex },
          props: null
        });
        state.idCounter += 1;
      }
    }

    const items = state.conditionLengths[index.scene];

    // Add a new frame if needed
    if (items >= state.frames.length)
      state.frames.push({
        index: state.frames.length,
        scenes: []
      });

    // Do any shifting needed
    for (let i = items - 1; i >= index.frame; i--) {
      // Fill gaps with blank scenes
      if (state.frames[i + 1].scenes.length < index.scene) fillBlankScenes(i + 1);

      // console.log("Replacing " + (i + 1) + " with " + i + ": " + state.frames[i].scenes[index.scene].props.name)
      state.frames[i + 1].scenes.splice(index.scene, 1, {
        id: state.frames[i].scenes[index.scene].id,
        index: { scene: index.scene, frame: i + 1 },
        props: state.frames[i].scenes[index.scene].props
      });
    }

    // Fill gaps with blank scenes
    fillBlankScenes(index.frame);

    // Increment conditionLengths
    state.conditionLengths.splice(index.scene, 1, state.conditionLengths[index.scene] + 1);

    // Replace last item with new scene
    state.frames[index.frame].scenes.splice(index.scene, 1, { id: state.idCounter, index, props: scene });
    state.idCounter += 1;
  },
  deleteScene: (state, index) => {
    let conditionLength = state.conditionLengths[index.scene];

    // console.log(state.frames.map(frame => frame.scenes.map(scene => scene.props ? scene.props.name : "Blank")))

    // Do any shifting up needed
    for (let i = index.frame; i < conditionLength - 1; i++) {
      state.frames[i].scenes.splice(index.scene, 1, {
        index: { scene: index.scene, frame: i },
        props: state.frames[i + 1].scenes[index.scene].props
      });
    }

    // If is the last scene in a condition (can't shift up) and not the rightmost scene, replace last scene with blank to make a gap
    if (index.frame <= conditionLength - 1 && index.scene < state.frames[conditionLength - 1].scenes.length - 1) {
      state.frames[conditionLength - 1].scenes.splice(index.scene, 1, {
        id: state.idCounter,
        index: { scene: index.scene, frame: conditionLength - 1 },
        props: null
      });
      state.idCounter += 1;
      // Otherwise just remove scene
    } else {
      state.frames[conditionLength - 1].scenes.splice(index.scene, 1);
    }

    // Decrement conditionLengths counter & update internal var
    state.conditionLengths.splice(index.scene, 1, conditionLength - 1);
    conditionLength = state.conditionLengths[index.scene];

    // --- Cleanup ----

    // If bottom frame is now empty remove it
    const maxConditionLength = state.conditionLengths.reduce((a, b) => Math.max(a, b));
    if (state.frames.length > maxConditionLength) state.frames.pop();

    // If deleted scene leaves a chain of un-needed blank scenes on the right remove them
    const targetFrame = state.frames[index.frame];
    const lastFrame = state.frames[conditionLength];

    // Do this for the target frame, the scene deleted from (unless the targetFrame was deleted due to being empty)
    if (index.frame < maxConditionLength) {
      for (let i = targetFrame.scenes.length - 1; targetFrame.scenes[i].props == null; i--) targetFrame.scenes.pop();
    }

    // Do this for the frame of the last condition scene (unless the last condition scene already occurred, in which case this is redundant)
    if (conditionLength > 0 && conditionLength < maxConditionLength) {
      for (let i = lastFrame.scenes.length - 1; lastFrame.scenes[i].props == null; i--) lastFrame.scenes.pop();
    }
  },
  moveFrame: (state, { fromIndex, toIndex }) => {
    // console.log(state.frames[fromIndex].scenes.length);
    // console.log(state.frames[toIndex].scenes.length);

    const minScenes = Math.min(state.frames[fromIndex].scenes.length, state.frames[toIndex].scenes.length);

    for (let i = 0; i < minScenes; i++) {
      state.frames[fromIndex].scenes[i].index.frame = toIndex;
      state.frames[toIndex].scenes[i].index.frame = fromIndex;
    }

    state.frames.splice(fromIndex, 1, {
      index: fromIndex,
      scenes: state.frames.splice(toIndex, 1, {
        index: toIndex,
        scenes: state.frames[fromIndex].scenes
      })[0].scenes
    });
  },
  moveScene: (state, { sceneIndex, fromIndex, toIndex }) => {
    state.frames[toIndex].scenes.splice(sceneIndex, 1, {
      id: state.frames[fromIndex].scenes[sceneIndex].id,
      index: { scene: sceneIndex, frame: toIndex },
      props: state.frames[fromIndex].scenes.splice(sceneIndex, 1, {
        id: state.frames[toIndex].scenes[sceneIndex].id,
        index: { scene: sceneIndex, frame: fromIndex },
        props: state.frames[toIndex].scenes[sceneIndex].props
      })[0].props
    });
  }
};
