import Vue from 'vue'; // eslint-disable-line import/no-extraneous-dependencies

// FIXME: fix nanoid warning
import { nanoid } from 'nanoid/non-secure';

// FIXME: make this a build time asset based on spec.json instead of using all of spec directly
import defaultScene from '../assets/spec.json';

export const state = () => ({
  conditionsLengths: [],
  frames: {},
  frameList: [],
  scenes: {}
});

export const getters = {
  frameSet: state => state.frameList.map(frameId => state.frames[frameId]),
  sceneSet: state => frameId => state.frames[frameId].scenes.map(sceneId => state.scenes[sceneId]),
  conditionsLength: state => state.frames[state.frameList[0]].scenes.length,
  defaultScene: state => defaultScene
};

export const actions = {
  async getExperiment({ commit }) {
    const response = await this.$axios.$get('/experiment.json');

    commit('setConditionLengths', response);
    commit('setFrames', response);
  },
  addCondition({ commit }) {
    commit('newCondition');
  },
  removeCondition({ commit }, index) {
    commit('deleteCondition', { index });
  },
  moveFrameDown({ commit }, frameId) {
    // Frame stack goes from 0 down incrementally, so add 1 to move down
    commit('moveFrame', { frameId, modifier: 1 });
  },
  moveFrameUp({ commit }, frameId) {
    // Frame stack goes from 0 down incrementally, so add -1 to move up
    commit('moveFrame', { frameId, modifier: -1 });
  },
  moveSceneDown({ commit }, { frame: frameId, scene: sceneId }) {
    // Frame stack goes from 0 down incrementally, so add 1 to move down
    commit('moveScene', { frameId, sceneId, modifier: 1 });
  },
  moveSceneUp({ commit }, { frame: frameId, scene: sceneId }) {
    // Frame stack goes from 0 down incrementally, so add -1 to move up
    commit('moveScene', { frameId, sceneId, modifier: -1 });
  },
  addScene({ commit }, { frame: frameId, scene: sceneId }) {
    commit('newScene', { frameId, sceneId });
  },
  removeScene({ commit }, { frame: frameId, scene: sceneId }) {
    commit('deleteScene', { frameId, sceneId });
  }
};

export const mutations = {
  setConditionLengths(state, conditions) {
    state.conditionLengths = conditions.map(condition => condition.scenes.length);
  },
  setFrames(state, conditions) {
    const tempFrames = {};
    const tempScenes = {};

    const maxColLength = conditions.map(condition => condition.scenes.length).reduce((a, b) => Math.max(a, b));

    for (let i = 0; i < maxColLength; i++) {
      const frameSceneList = [];

      for (let j = 0; j < conditions.length; j++) {
        if (conditions[j].scenes[i]) {
          // Set up scenes
          const id = nanoid();

          tempScenes[id] = { id, props: conditions[j].scenes[i] };
          frameSceneList.push(id);
        }
      }
      // Set up frame
      const id = nanoid();
      tempFrames[id] = { id, scenes: frameSceneList };

      // Add id (in order) to frameList
      state.frameList.push(id);
    }

    // Reactively set store states to the created normalized states
    state.frames = Object.assign({}, state.frames, tempFrames);
    state.scenes = Object.assign({}, state.scenes, tempScenes);
  },
  newCondition(state) {
    const id = nanoid();
    const firstFrame = state.frames[state.frameList[0]];

    // Update frame[0]
    firstFrame.scenes.push(id);

    // Add scene to scenes
    Vue.set(state.scenes, id, { id, props: defaultScene.scene });
  },
  deleteCondition(state, payload) {
    state.frameList.forEach(frameId => {
      // Remove scene from frame
      const removedSceneId = state.frames[frameId].scenes.splice(payload.index, 1);

      // Remove scene from scenes
      Vue.delete(state.scenes, removedSceneId);
    });
  },
  moveFrame(state, payload) {
    const fromIndex = state.frameList.indexOf(payload.frameId);

    const toIndex = fromIndex + payload.modifier;

    // Swap 2 frames using splice
    state.frameList.splice(fromIndex, 1, state.frameList.splice(toIndex, 1, payload.frameId)[0]);
  },
  moveScene(state, payload) {
    // Lookup index of scene in frame to find scene position
    const sceneIndex = state.frames[payload.frameId].scenes.indexOf(payload.sceneId);

    // Lookup index of scene's frame to find next frame
    const toFrameId = state.frameList[state.frameList.indexOf(payload.frameId) + payload.modifier];

    // Swap 2 scenes using splice
    state.frames[payload.frameId].scenes.splice(
      sceneIndex,
      1,
      state.frames[toFrameId].scenes.splice(sceneIndex, 1, payload.sceneId)[0]
    );
  },
  newScene(state, payload) {
    // Add one to frameIndex as it should target the frame below the add button
    const frameIndex = state.frameList.indexOf(payload.frameId) + 1;
    const sceneIndex = state.frames[payload.frameId].scenes.indexOf(payload.sceneId);
    const conditionLength = state.conditionLengths[sceneIndex];

    // Add a new frame if adding to bottom or shifting to bottom
    if (conditionLength >= state.frameList.length) {
      // Construct frame at bottom with scenes already spaced
      const id = nanoid();
      Vue.set(state.frames, id, { id, scenes: Array(sceneIndex).fill(nanoid()) });
      state.frameList.push(id);
      // Add new scenes to state.scenes
      state.frames[id].scenes.map(sceneId => Vue.set(state.scenes, sceneId, { id: sceneId, props: null }));
    }

    // Do any shifting necessary
    for (let i = conditionLength - 1; i >= frameIndex; i--) {
      const currentFrame = state.frames[state.frameList[i]];
      const nextFrame = state.frames[state.frameList[i + 1]];

      // Fill frames that come before it with blanks, if necessary, to use as gaps
      for (let j = nextFrame.length; j < sceneIndex; j++) {
        const id = nanoid();
        Vue.set(state.scenes, id, { id, props: null });
        currentFrame.scenes.push(id);
      }

      // Shift current frame down to next frame
      nextFrame.scenes.splice(sceneIndex, 1, currentFrame.scenes[sceneIndex]);
    }

    // Update conditionLengths
    state.conditionLengths.splice(sceneIndex, 1, state.conditionLengths[sceneIndex] + 1);

    // Add scene
    const targetFrame = state.frames[state.frameList[frameIndex]];

    // If added scene needs to be spaced, add spacing
    // FIXME: make this a more convenient function? Counter function?
    for (let j = targetFrame.scenes.length; j < sceneIndex; j++) {
      const id = nanoid();
      Vue.set(state.scenes, id, { id, props: null });
      targetFrame.scenes.push(id);
    }

    // Insert new scene
    const id = nanoid();
    Vue.set(state.scenes, id, { id, props: defaultScene.scene });
    // Replace last item with new scene
    targetFrame.scenes.splice(sceneIndex, 1, id);
  },
  deleteScene(state, payload) {
    const frameIndex = state.frameList.indexOf(payload.frameId);
    const sceneIndex = state.frames[payload.frameId].scenes.indexOf(payload.sceneId);

    const conditionLength = state.conditionLengths[sceneIndex];

    // Do any shifting up needed
    for (let i = frameIndex; i < conditionLength - 1; i++) {
      const currentFrame = state.frames[state.frameList[i]];
      const nextFrame = state.frames[state.frameList[i + 1]];

      currentFrame.scenes.splice(sceneIndex, 1, nextFrame.scenes[sceneIndex]);
    }

    // If not the bottom-most scene of a condition and not the rightmost scene, replace last scene with blank to make a gap
    const bottomConditionFrame = state.frames[state.frameList[conditionLength - 1]];
    if (frameIndex <= conditionLength - 1 && sceneIndex < bottomConditionFrame.scenes.length - 1) {
      const id = nanoid();
      Vue.set(state.scenes, id, { id, props: null });
      bottomConditionFrame.scenes.splice(sceneIndex, 1, id);
    } else {
      // Otherwise just remove scene
      bottomConditionFrame.scenes.splice(sceneIndex, 1);
    }

    // Decrement conditionLengths counter & update internal var
    state.conditionLengths.splice(sceneIndex, 1, conditionLength - 1);
    // conditionLength = state.conditionLengths[index.scene];

    /* ---- Cleanup ----- */
    const targetFrame = state.frames[state.frameList[frameIndex]];
    const lastFrameIndex = state.frameList.length - 1;
    const lastFrame = state.frames[state.frameList[lastFrameIndex]];

    // If the last frame isn't empty clean it
    if (lastFrame.scenes.length > 0) {
      for (let i = lastFrame.scenes.length - 1; i >= 0 && state.scenes[lastFrame.scenes[i]].props == null; i--) {
        lastFrame.scenes.pop();
      }
    }

    // If the last frame is now empty (after cleaning) or was empty delete it
    if (lastFrame.scenes.length <= 0) {
      state.frameList.pop();
      Vue.delete(state.frames, lastFrame.id);
    }

    // If targetFrame is not the lastFrame clean it as well
    if (frameIndex !== lastFrameIndex) {
      for (let i = targetFrame.scenes.length - 1; state.scenes[targetFrame.scenes[i]].props == null; i--)
        targetFrame.scenes.pop();
    }
  }
};
