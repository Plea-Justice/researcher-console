export const state = () => ({
  conditionNames: [],
  conditionLengths: [],
  frames: [],
  idCounter: 1
});

export const getters = {
  // General
  conditionNames: (state) => state.conditionNames,
  frames: (state) => state.frames,

  // Frame & Scene
  isFirst: (state) => (index) => (
    typeof index == 'object' ?
    index.frame == 0 : // Scene
    index == 0         // Frame
  ),
  isLast: (state) => (index) => (
    typeof index == 'object' ?
    index.frame == state.conditionLengths[index.scene] - 1 :  // Scene
    index == state.frames.length - 1                          // Frame
  ),

  // Scene
  isBlank: (state) => (index) => state.frames[index.frame].scenes[index.scene].props == null,
};

export const actions = {
  async getExperiment({ commit }) {
    const response = await this.$axios.$get('/experiment.json');

    commit('setConditionNames', response);
    commit('setConditionLengths', response)
    commit('setFrames', response);
  },
  addCondition({ commit }, scene) {
    // <!-- FIXME: Handle what is used as a new scene more reliably -->
    commit('newCondition', scene)
  },
  removeCondition({ commit }, index) {
    commit('deleteCondition', index)
  },
  addScene({ commit }, { index, scene }) {
    // <!-- FIXME: Handle what is used as a new scene more reliably -->
    commit('newScene', { index: { scene: index.scene, frame: index.frame + 1 }, scene })
  },
  removeScene({ commit }, index) {
    commit('deleteScene', index)
  },
  moveFrameUp({ commit }, frameIndex) {
    commit('moveFrame', { fromIndex: frameIndex, toIndex: frameIndex - 1 })
  },
  moveFrameDown({ commit }, frameIndex) {
    commit('moveFrame', { fromIndex: frameIndex, toIndex: frameIndex + 1 })
  },
  moveSceneUp({ commit }, index) {
    commit('moveScene', { sceneIndex: index.scene, fromIndex: index.frame, toIndex: index.frame - 1 })
  },
  moveSceneDown({ commit }, index) {
    commit('moveScene', { sceneIndex: index.scene, fromIndex: index.frame, toIndex: index.frame + 1 })
  }
}

export const mutations = {
  setConditionNames(state, conditions) {
    state.conditionNames = conditions.map(condition => condition.name)
  },
  setConditionLengths(state, conditions) {
    state.conditionLengths = conditions.map(condition => condition.scenes.length)
  },
  setFrames(state, conditions) {
    const maxColLength = state.conditionLengths.reduce((a, b) => Math.max(a, b))

    //TODO: improve this to use maps instead
    let arr = [];
    for (let i = 0; i < maxColLength; i++) {
      let arr2 = [];
      for (let j = 0; j < conditions.length; j++) {
        if (conditions[j].scenes[i]) {
          arr2.push({
            id: state.idCounter,
            index: { scene: j, frame: i },
            props: conditions[j].scenes[i]
          });
          state.idCounter++;
        }
      }
      arr.push({ index: i, scenes: arr2 });
    }

    state.frames = arr;
  },
  newCondition: (state, scene) => {
    const newIndex = state.conditionNames.length + 1

    // Add condition name and first empty scene to condition
    // TODO: have formal condition name format
    state.conditionNames.push(`Experimental Condition ${newIndex}`)
    state.frames[0].scenes.push({
      id: state.idCounter,
      index: { scene: newIndex, frame: 0 },
      props: scene
    })
    state.idCounter++;

    // Adjust ConditionLengths to have a new condition
    state.conditionLengths.push(1)
  },
  deleteCondition: (state, conditionIndex) => {
    // Remove conditionName and conditionLength
    state.conditionNames.splice(conditionIndex, 1)
    const sceneIndex = state.conditionLengths.splice(conditionIndex, 1)

    // Remove all scenes for that condition
    for(let i = 0; i < sceneIndex; i++)
      state.frames[i].scenes.splice(conditionIndex, 1);
  },
  newScene: (state, { index, scene }) => {
    const items = state.conditionLengths[index.scene]

    // Add a new frame if needed
    if(items >= state.frames.length)
      state.frames.push({
        index: state.frames.length,
        scenes: []
      });

    // Do any shifting needed
    for(let i = items - 1; i >= index.frame; i--) {
      //console.log("Replacing " + (i + 1) + " with " + i + ": " + state.frames[i].scenes[index.scene].props.name)
      state.frames[i + 1].scenes.splice(index.scene, 1, {
        id: state.frames[i].scenes[index.scene].id,
        index: { scene: index.scene, frame: i + 1 },
        props: state.frames[i].scenes[index.scene].props
      })
    }

    // Fill gaps with blank scenes
    const frameLength = state.frames[index.frame].scenes.length
    for(let i = frameLength; i < index.scene; i++) {
      state.frames[index.frame].scenes.push({
        id: state.idCounter,
        index: { scene: i, frame: index.frame },
        props: null
      })
    }
    state.idCounter++;

    // Increment conditionLengths
    state.conditionLengths.splice(index.scene, 1, state.conditionLengths[index.scene] + 1)

    // Replace last item with new scene
    state.frames[index.frame].scenes.splice(index.scene, 1, { id: state.idCounter, index, props: scene })
    state.idCounter++
  },
  deleteScene: (state, index) => {
    let conditionLength = state.conditionLengths[index.scene];

    //console.log(state.frames.map(frame => frame.scenes.map(scene => scene.props ? scene.props.name : "Blank")))

    // Do any shifting up needed
    for(let i = index.frame; i < conditionLength - 1; i++) {
      state.frames[i].scenes.splice(index.scene, 1, {
        index: { scene: index.scene, frame: i },
        props: state.frames[i + 1].scenes[index.scene].props
      })
    };

    // If is the last scene in a condition (can't shift up) and not the rightmost scene, replace last scene with blank to make a gap
    if(index.frame <= conditionLength - 1 && index.scene < state.frames[conditionLength - 1].scenes.length - 1) {
      state.frames[conditionLength - 1].scenes.splice(index.scene, 1, {
        id: state.idCounter,
        index: { scene: index.scene, frame: conditionLength - 1 },
        props: null
    });
    state.idCounter++;
    // Otherwise just remove scene
    } else {
      state.frames[conditionLength - 1].scenes.splice(index.scene, 1);
    }

    // Decrement conditionLengths counter & update internal var
    state.conditionLengths.splice(index.scene, 1, conditionLength - 1)
    conditionLength = state.conditionLengths[index.scene];

    // --- Cleanup ----

    // If bottom frame is now empty remove it
    if(state.conditionLengths.reduce((a, b) => Math.max(a, b)) < state.frames.length)
      state.frames.pop()

    // If deleted scene leaves a chain of un-needed blank scenes on the right remove them
    const targetFrame = state.frames[index.frame]
    const lastFrame = state.frames[conditionLength - 1]

    // Do this for the target frame the scene deleted from
    for(let i = targetFrame.scenes.length - 1; targetFrame.scenes[i].props == null; i--)
    targetFrame.scenes.pop()

    // Do this for the frame of the last condition scene (unless the last condition scene already occurred, in which case this is redundant)
    if(conditionLength > 0) {
      for(let i = lastFrame.scenes.length - 1; lastFrame.scenes[i].props == null; i--)
        lastFrame.scenes.pop()
    }

    //console.log(state.frames.map(frame => frame.scenes.map(scene => scene.props ? scene.props.name : "Blank")))
  },
  moveFrame: (state, { fromIndex, toIndex }) => {
    state.frames[fromIndex] = {
      index: fromIndex,
      scenes: state.frames.splice(toIndex, 1, {
        index: toIndex,
        scenes: state.frames[fromIndex].scenes
      })[0].scenes
    }
  },
  moveScene: (state, { sceneIndex, fromIndex, toIndex }) => {
    state.frames[toIndex].scenes
    .splice(sceneIndex, 1, {
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
