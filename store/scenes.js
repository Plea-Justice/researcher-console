import Vue from 'vue'

export const state = () => ({
  conditionNames: [],
  conditionLengths: [],
  frames: []
});

export const getters = {
  conditionNames: (state) => state.conditionNames,
  frames: (state) => state.frames,
  frameSize: (state) => state.frames.length,
};

export const actions = {
  async getExperiment({ commit }) {
    const response = await this.$axios.$get('/experiment.json');

    commit('setConditionNames', response);
    commit('setFrames', response);
    commit('setConditionLengths', response)
  },
  addCondition({ commit }, scene) {
    commit('newCondition', scene)
  },
  addScene({ commit }, scenePackage) {
    commit('newScene', scenePackage)
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

    //TODO: clean this so map isn't needed and reduces directly
    //FIXME: use conditionLengths
    const maxColLength = conditions
    .map(condition => condition.scenes.length)
    .reduce((a, b) => Math.max(a, b));

  //TODO: improve this to use maps instead
  let arr = [];
  for (let i = 0; i < maxColLength; i++) {
    let arr2 = [];
    for (let j = 0; j < conditions.length; j++) {
      if (conditions[j].scenes[i]) {
        arr2.push({ index: { scene: j, frame: i }, props: conditions[j].scenes[i] });
      }
    }
    arr.push({ index: i, scenes: arr2 });
  }

  /*
  const baseIndex = conditions.reduce(
    (p, c, i, a) => (a[p].length > c.length ? p : i),
      0
  );*/

   state.frames = arr;
  },
  newCondition: (state, scene) => {
    const newIndex = state.conditionNames.length + 1

    state.conditionNames.push(`Experimental Condition ${newIndex}`)
    state.frames[0].scenes.push(scene)

  },
  newScene: (state, { index, scene }) => {
    console.log(index.frame)
    // Debug
    //console.log(state.frames.map(frame => frame.scenes.map(scene => scene.name)))

    const items = state.conditionLengths[index.scene]

    // Add a new frame if needed
    if(items >= state.frames.length) {
      state.frames.push({
        index: state.frames.length,
        scenes: []
      });
    }

    //FIXME: fix bug where randomly adding scenes ro rhs sometimes adds a scene on the same row
    //FIXME: fix this so it updates the index properly
    //FIXME: trying to add multiple scenes at once breaks this, just disable this?
    const newScene = { index: { scene: index.scene, frame: index.frame + 1 }, props: scene }

    if(items - 1 == index.frame) { // if adding to last end of list just push new element on
      //FIXME: handle blank scenes
      state.frames[items].scenes.splice(index.scene, 0, newScene);
    } else { // Do shifting
      let i;
      let first = true

      //FIXME: when adding a new frame for a scene after index 0 add blank scene so they properly align.
      for(i = items - 1; i > index.frame; i--) {
      if(i == index.frame + 1) { // If last (or first and last) iteration place shift down and push element directly in
          //TODO: take a look at wether last should push (recall this covers first too rn)
          state.frames[i + 1].scenes.push(state.frames[i].scenes.splice(index.scene, 1, newScene)[0])
      } else if(first) { // if first push element down
          state.frames[i + 1].scenes.push(state.frames[i].scenes.splice(index.scene, 1, state.frames[i - 1].scenes[index.scene])[0])
          first = false;
        } else { // Otherwise keep shifting frames down
          state.frames[i].scenes.splice(index.scene, 1, state.frames[i - 1].scenes[index.scene])
        }
      };
    }

    // Increment conditionLengths
    state.conditionLengths[index.scene] += 1

    // Debug
    /*
    console.log(state.frames.map(frame => frame.scenes.map(scene =>
      scene ? scene.name : "Error"
    )))
    */
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

    // Remove last item and decrement conditionLenghts counter
    state.frames[items - 1].scenes.pop();
    state.conditionLengths[index.scene] -= 1;

    if(state.conditionLengths.reduce((a, b) => Math.max(a, b)) < state.frames.length)
      state.frames.pop()
  },
  moveFrame: (state, { fromIndex, toIndex }) => {
    state.frames[fromIndex].frameIndex = toIndex
    state.frames[toIndex].frameIndex = fromIndex

    state.frames[fromIndex] = state.frames.splice(toIndex, 1, state.frames[fromIndex])[0]
    //state.frames = [ state.frames[targetIndex], state.frames[targetIndex - 1] ] = [ state.frames[targetIndex - 1], state.frames[targetIndex] ]
  },
  moveScene: (state, { sceneIndex, fromIndex, toIndex }) => {

    //const removed = state.frames[fromIndex].scenes.splice(0, 1, state.frames[toIndex].scenes[sceneIndex])[0];
    //state.frames[toIndex].scenes.splice(0, 1, removed);
    //state.frames[fromIndex].scenes[sceneIndex].index = { scene: sceneIndex, frame: toIndex }
    //state.frames[toIndex].scenes[sceneIndex].index = { scene: sceneIndex, frame: fromIndex }
    //Vue.set(state.frames[fromIndex].scenes[sceneIndex].index, 'frame', toIndex)
    //Vue.set(state.frames[toIndex].scenes[sceneIndex].index, 'frame', fromIndex)

    //FIXME: fit his so it updates the scene index

    state.frames[toIndex].scenes
    .splice(sceneIndex, 1, state.frames[fromIndex].scenes
      .splice(sceneIndex, 1, state.frames[toIndex].scenes[sceneIndex])[0]);

   //const removed = state.frames[toIndex].scenes.splice(sceneIndex, 1)[0];
   //console.log(removed)
   //console.log(state.frames[fromIndex].scenes.splice(sceneIndex, 1, removed)[0])

    //console.log("from: " + fromIndex + ", to: " + toIndex)
    //console.log("Scene: " + state.frames[fromIndex].scenes[sceneIndex].props.name + ", frame: " + state.frames[fromIndex].scenes[sceneIndex].index.frame)
  }
};
