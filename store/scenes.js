export const state = () => ({
  conditionNames: [],
  conditionLengths: [],
  frames: [],
  idCounter: 1
});

export const getters = {
  conditionNames: (state) => state.conditionNames,
  frames: (state) => state.frames,
  isFirstFrame: (state) => (index) => index == 0,
  isLastFrame: (state) => (index) => index == state.frames.length - 1
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
    const items = state.conditionLengths.splice(conditionIndex, 1)

    // Remove all scenes for that condition
    for(let i = 0; i < items; i++)
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
    let i;
    for(i = items - 1; i >= index.frame; i--) {
      //console.log("Replacing " + (i + 1) + " with " + i + ": " + state.frames[i].scenes[index.scene].props.name)
      state.frames[i + 1].scenes.splice(index.scene, 1, {
        id: state.frames[i].scenes[index.scene].id,
        index: { scene: index.scene, frame: i + 1 },
        props: state.frames[i].scenes[index.scene].props
      })
    }

    // Increment conditionLengths
    state.conditionLengths[index.scene] += 1

    // If a rhs column is extended add a blank scene(s) to left
    const isScattered = state.conditionLengths.reduce((a, b) => Math.max(a, b)) <= state.conditionLengths[index.scene]
    if(index.scene > 0 && isScattered) {
      for(i = 0; i < index.scene; i++) {
        state.frames[index.frame].scenes.push({
          id: -1,
          index: { scene: i, frame: index.frame },
          props: null
        })
      }
    }

    // Replace last item
    state.frames[index.frame].scenes.splice(index.scene, 1, { id: state.idCounter, index, props: scene })
    state.idCounter++
  },
  deleteScene: (state, index) => {
    const items = state.conditionLengths[index.scene];

    let i;
    for(i = index.frame; i < items - 1; i++) {
      //console.log("Replacing " + i + ": " + state.frames[i].scenes[index.scene].props.name + " -> " + (i + 1) + ": " + state.frames[i + 1].scenes[index.scene].props.name)
      state.frames[i].scenes.splice(index.scene, 1, {
        index: { scene: index.scene, frame: i },
        props: state.frames[i + 1].scenes[index.scene].props
      })
    };

    // Remove last scene and decrement conditionLengths counter
    state.frames[items - 1].scenes.pop();
    state.conditionLengths[index.scene] -= 1;

    if(state.conditionLengths.reduce((a, b) => Math.max(a, b)) < state.frames.length)
      state.frames.pop()
  },
  moveFrame: (state, { fromIndex, toIndex }) => {
    //state.frames[fromIndex].frameIndex = toIndex
    //state.frames[toIndex].frameIndex = fromIndex

    //state.frames[fromIndex] = state.frames.splice(toIndex, 1, state.frames[fromIndex])[0]

    state.frames[fromIndex] = {
      index: fromIndex,
      scenes: state.frames.splice(toIndex, 1, {
        index: toIndex,
        scenes: state.frames[fromIndex].scenes
      })[0].scenes
    }

    //state.frames = [ state.frames[targetIndex], state.frames[targetIndex - 1] ] = [ state.frames[targetIndex - 1], state.frames[targetIndex] ]
    /*
    moveFrame: (state, { fromIndex, toIndex }) => {
      state.frames[fromIndex] = {
        index: toIndex,
        scenes: state.frames.splice(toIndex, 1, {
            index: fromIndex,
            scenes: state.frames[fromIndex].scenes
          })[0].scenes
    }
      */
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
