export const state = () => ({
  conditionNames: [],
  frames: [],
});

export const getters = {
  conditionNames: (state) => state.conditionNames,
  frames: (state) => state.frames,
  frameSize: (state) => state.frames.length,
  frames: (state) => state.frames,
};

export const actions = {
  async getExperiment({ commit }) {
    const response = await this.$axios.$get('/experiment.json');

    commit('setConditionNames', response);
    commit('setFrames', response);
  },
  addCondition({ commit }, scene) {
    commit('newCondition', scene)
  },
  addScene({ commit }, scenePackage) {
    commit('newScene', scenePackage)
  },
  moveFrameUp({ commit }, frameIndex) {
    commit('moveFrame', { fromIndex: frameIndex, toIndex: frameIndex - 1 })
  },
  moveFrameDown({ commit }, frameIndex) {
    commit('moveFrame', { fromIndex: frameIndex, toIndex: frameIndex + 1 })
  },
  moveSceneUp({ commit }, {frameIndex, sceneIndex}) {
    commit('moveScene', { sceneIndex, fromIndex: frameIndex, toIndex: frameIndex - 1 })
  },
  moveSceneDown({ commit }, frameIndex) {
    commit('moveFrame', { fromIndex: frameIndex, toIndex: frameIndex + 1 })
  }
}

export const mutations = {
  setConditionNames(state, conditions) {
    state.conditionNames = conditions.map(condition => condition.name)
  },
  setConditions() {

  },
  setFrames(state, conditions) {

    //TODO: clean this so map isn't needed and reduces directly
    const maxColLength = conditions
    .map(condition => condition.scenes.length)
    .reduce((a, b) => Math.max(a, b));

  let arr = [];
  for (let i = 0; i < maxColLength; i++) {
    let arr2 = [];
    for (let j = 0; j < conditions.length; j++) {
      if (conditions[j].scenes[i]) {
        arr2.push(conditions[j].scenes[i]);
      }
    }
    arr.push({ frameIndex: i, scenes: arr2 });
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
  newScene: (state, { frameIndex: frameIndex, sceneIndex, scene }) => {
    // Debug
    console.log(state.frames.map(frame => frame.scenes.map(scene => scene.name)))

    /*
    let length = 0;
    while(state.frames[length] && state.frames[length].scenes[sceneIndex]) length++;
    //console.log("Has " + length)
    */

    const length = state.frames.reduce((len, frame) => len + (frame.scenes[sceneIndex] ? 1 : 0), 0)

    // Add a new frame if needed
    if(length >= state.frames.length) {
      state.frames.push({
        frameIndex: state.frames.length,
        scenes: []
      });
    }

    // Do any shifting that is needed
    let i;
    let first = true
    for(i = length - 1; i > frameIndex; i--) {
    if(i == frameIndex + 1) { // if last iteration place element directly in
        console.log("Last")
        state.frames[i + 1].scenes.push(state.frames[i].scenes.splice(sceneIndex, 1, scene)[0])
    } else if(first) {
        state.frames[i + 1].scenes.push(state.frames[i].scenes.splice(sceneIndex, 1, state.frames[i - 1].scenes[sceneIndex])[0])
        first = false;
      } else {
        console.log("after")
        state.frames[i].scenes.splice(sceneIndex, 1, state.frames[i - 1].scenes[sceneIndex])
      }
    };

    // Debug

    console.log(state.frames.map(frame => frame.scenes.map(scene =>
      scene ? scene.name : "Error"
    )))


    // Add new frame
    //state.frames[frameIndex + 1].scenes.unshift(scene)
  },
  moveFrame: (state, { fromIndex, toIndex }) => {
    state.frames[fromIndex].frameIndex = toIndex
    state.frames[toIndex].frameIndex = fromIndex

    state.frames[fromIndex] = state.frames.splice(toIndex, 1, state.frames[fromIndex])[0]
    //state.frames = [ state.frames[targetIndex], state.frames[targetIndex - 1] ] = [ state.frames[targetIndex - 1], state.frames[targetIndex] ]
  },
  moveScene: (state, { sceneIndex, fromIndex, toIndex }) => {
    //state.frames[fromIndex].scenes[sceneIndex] =  state.frames[toIndex].scenes.splice(sceneIndex, 1, state.frames[fromIndex].scenes[sceneIndex])[0]
    //console.log(state.frames[fromIndex].scenes.splice(sceneIndex, 1)[0])
    //console.log(state.frames[fromIndex].scenes)

    let obj1 = Object.assign({}, state.frames[fromIndex]);
    let obj2 = Object.assign({}, state.frames[toIndex]);

    const removed = obj1.scenes.splice(1, 1, state.frames[toIndex].scenes[sceneIndex])[0];
    obj2.scenes.splice(1, 1, removed);

    console.log(obj1.scenes.map(scene => scene.name))
    console.log(obj2.scenes.map(scene => scene.name))

    state.frames.splice(fromIndex, 1, obj1);
    state.frames.splice(toIndex, 1, obj2);
  }
};
