/* eslint no-shadow: ["error", { "allow": ["state"] }] */
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';

import { nanoid } from 'nanoid/non-secure';

// FIXME: make this a build time asset based on spec.json instead of using all of spec directly
// Lazy load/code-split this?
import spec from '../assets/spec.json';

const initialState = () => ({
  id: '',
  numScenes: 0,
  meta: {
    name: '',
    description: '',
    survey: ''
  },
  frames: {},
  frameList: [],
  scenes: {}
});

export const state = () => initialState();

export const getters = {
  scenarioMeta: state => ({ id: state.id, ...state.meta }),
  frameSet: state => state.frameList.map(frameId => state.frames[frameId]),
  sceneSet: state => frameId => state.frames[frameId].scenes.map(sceneId => state.scenes[sceneId]),
  numConditions: state => (state.frameList.length ? state.frames[state.frameList[0]].scenes.length : 0),
  numScenes: state => state.numScenes
};

export const actions = {
  // **** Axios Actions ****
  async getScenario({ commit, state }, id) {
    const response = await this.$axios.$get(`/api/v1/scenarios/${id}`);
    if (response.success) {
      // Reset state representation write in data from server request
      commit('resetState');
      commit('setScenario', response.result);

      // If new new Scenario (no frames exists) create an initial frame
      if (!state.frameList.length) commit('newFrame');
    }
  },
  async saveScenario({ state }) {
    await this.$axios.$put(`/api/v1/scenarios/${state.id}`, state);
  },

  // **** Scenario Actions ****
  updateMeta({ commit }, meta) {
    commit('updateMeta', { meta });
  },

  // **** Condition Actions
  addCondition({ commit }) {
    commit('newCondition');
  },
  removeCondition({ commit }, index) {
    commit('deleteCondition', { index });
  },
  copyCondition({ commit }, indexList) {
    // Vue indexes start at 1 (off by 1) so subtract 1
    commit('copyCondition', { fromIndex: indexList[0], toIndex: indexList[1] });
  },
  swapCondition({ commit }, indexList) {
    commit('swapCondition', { indexList });
  },

  // **** Frame Actions ****
  addFrame({ commit }, frameId) {
    commit('newFrame', { frameId });
  },
  removeFrame({ commit }, frameId) {
    commit('deleteFrame', { frameId });
  },
  moveFrameDown({ commit }, frameId) {
    // Frame stack goes from 0 down incrementally, so add 1 to move down
    commit('moveFrame', { frameId, modifier: 1 });
  },
  moveFrameUp({ commit }, frameId) {
    // Frame stack goes from 0 down incrementally, so add -1 to move up
    commit('moveFrame', { frameId, modifier: -1 });
  },

  // **** Scene Actions ****
  addScene({ commit }, sceneId) {
    commit('newScene', { sceneId });
  },
  removeScene({ commit }, sceneId) {
    commit('deleteScene', { sceneId });
  },
  copyScene({ commit }, idList) {
    commit('copyScene', { fromId: idList[0], toId: idList[1] });
  },
  bindScene({ commit }, idList) {
    commit('bindScene', { fromId: idList[0], toId: idList[1] });
  },
  unbindScene({ commit }, { id, props }) {
    commit('unbindScene', { fromId: id, toId: props });
  },
  swapScene({ commit }, idList) {
    commit('swapScene', { idList });
  },

  // Form Actions
  updateSceneType({ commit }, { id, value }) {
    commit('updateSceneProps', { sceneId: id, entry: { type: value } });
  },
  updateSceneForm({ commit }, { id, key, val }) {
    commit('setScenePropsKey', { sceneId: id, entry: { [key]: val } });
  },
  // FIXME: finish these or remove
  setSceneValid({ commit }, sceneId) {
    commit('setSceneValidity', { sceneId, valid: true });
  },
  setSceneInvalid({ commit }, sceneId) {
    commit('setSceneValidity', { sceneId, valid: false });
  }
};

export const mutations = {
  // **** Module Mutations ****
  resetState(state) {
    Object.assign(state, initialState());
  },

  // **** Axios Mutations ****
  setScenario(state, scenario) {
    Object.assign(state, scenario);
  },

  // **** Scenario Mutations ****
  updateMeta(state, payload) {
    Object.keys(state.meta).forEach(key => {
      if (payload.meta[key]) Vue.set(state.meta, key, payload.meta[key]);
    });
  },

  // **** Condition Mutations ****
  newCondition(state) {
    // Copy last condition into new condition
    const numFrames = state.frameList.length;
    for (let i = 0; i < numFrames; i++) {
      const id = nanoid();
      const currFrame = state.frames[state.frameList[i]];
      const lastScene = state.scenes[currFrame.scenes[currFrame.scenes.length - 1]];

      Vue.set(state.scenes, id, { ...lastScene, ...{ id } });
      // FIXME: fix these being direct mutations?
      currFrame.scenes.push(id);
      if (lastScene.props !== null) {
        Vue.set(currFrame, 'size', currFrame.size + 1);
        state.numScenes += 1;
      }
    }
  },
  deleteCondition(state, payload) {
    const numConditions = state.frames[state.frameList[0]].scenes.length;

    if (numConditions <= 1) {
      // If last Condition replace everything with a blank scene

      // Reset all frames and scenes
      state.frameList = [];
      state.frames = {};
      state.scenes = {};
      // Add blank scene
      const sceneId = nanoid();
      Vue.set(state.scenes, sceneId, { id: sceneId, props: null });
      // Create new frame holding only new blank scene
      const frameId = nanoid();
      Vue.set(state.frames, frameId, { id: frameId, size: 0, scenes: [sceneId] });
      state.frameList.push(frameId);
    } else {
      state.frameList.forEach(frameId => {
        // Remove that conditions scene's from each frame
        // FIXME: fix this being a direct mutation?
        const removedSceneId = state.frames[frameId].scenes.splice(payload.index, 1);
        // Adjust frame size
        if (state.scenes[removedSceneId].props !== null) {
          const currFrame = state.frames[frameId];
          Vue.set(state.frames, frameId, { ...currFrame, size: currFrame.size - 1 });
          state.numScene -= 1;
        }
        // Remove scene from scenes
        Vue.delete(state.scenes, removedSceneId);
      });
    }
  },
  copyCondition(state, payload) {
    // Copy last condition into new condition
    const numFrames = state.frameList.length;
    for (let i = 0; i < numFrames; i++) {
      const currFrame = state.frames[state.frameList[i]];
      const targetScene = state.scenes[currFrame.scenes[payload.fromIndex]];
      const toId = state.scenes[currFrame.scenes[payload.toIndex]].id;

      Vue.set(state.scenes, toId, { ...targetScene, ...{ id: toId } });
    }
  },
  swapCondition(state, payload) {
    const numFrames = state.frameList.length;
    for (let i = 0; i < numFrames; i++) {
      const currFrame = state.frames[state.frameList[i]];

      currFrame.scenes.splice(
        payload.indexList[0],
        1,
        currFrame.scenes.splice(payload.indexList[1], 1, currFrame.scenes[payload.indexList[0]])[0]
      );
    }
  },

  // **** Frame Mutations ****
  newFrame(state, payload) {
    const framesLength = state.frameList.length ? state.frames[state.frameList[0]].scenes.length : 1;

    // Create scenes for new frame
    const frameScenes = [];
    for (let i = 0; i < framesLength; i++) {
      const id = nanoid();
      Vue.set(state.scenes, id, { id, valid: null, props: null });
      frameScenes.push(id);
    }

    // Create frame
    const id = nanoid();
    Vue.set(state.frames, id, { id, size: 0, scenes: frameScenes });
    if (payload && state.frameList.length) state.frameList.splice(state.frameList.indexOf(payload.frameId) + 1, 0, id);
    else state.frameList.push(id);
  },
  deleteFrame(state, payload) {
    const frame = state.frames[payload.frameId];
    const sceneLength = frame.scenes.length;

    // If last frame just replace scenes with empty scenes
    if (state.frameList.length <= 1) {
      frame.scenes.forEach(sceneId => Vue.set(state.scenes, sceneId, { id: sceneId, props: null }));

      // Update Frame data
      Vue.set(state.frames, payload.frameId, { ...frame, size: 0 });
    } else {
      // Remove scenes in frame
      state.frames[payload.frameId].scenes.forEach(sceneId => Vue.delete(state.scenes, sceneId));

      // Remove frame
      state.frameList.splice(state.frameList.indexOf(payload.frameId), 1);
      Vue.delete(state.frames, payload.frameId);
    }

    // Update scene count
    state.numScenes -= sceneLength;
  },
  moveFrame(state, payload) {
    const fromIndex = state.frameList.indexOf(payload.frameId);
    const toIndex = fromIndex + payload.modifier;

    // Swap 2 frames using splice
    state.frameList.splice(fromIndex, 1, state.frameList.splice(toIndex, 1, payload.frameId)[0]);
  },

  // **** Scene Mutations ****
  newScene(state, payload) {
    const currFrame =
      state.frames[state.frameList[state.frameList.findIndex(id => state.frames[id].scenes.includes(payload.sceneId))]];
    const prevSceneIdx = currFrame.scenes.indexOf(payload.sceneId) - 1;
    const prevSceneProps =
      prevSceneIdx >= 0 ? Object.assign({}, state.scenes[currFrame.scenes[prevSceneIdx]].props) : null;

    // FIXME: make this static or something?
    // If prev scene has props use those, otherwise create default props list
    const newSceneProps = prevSceneProps || {
      ...Object.fromEntries(Object.keys(spec.scene).map(key => [key, ''])),
      type: Object.keys(spec.sceneTypes)[1]
    };

    Vue.set(state.scenes, payload.sceneId, { id: payload.sceneId, valid: null, props: newSceneProps });
    // TODO: Can you reactively update a key instead of replacing everything else?
    Vue.set(state.frames, currFrame.id, { ...currFrame, size: currFrame.size + 1 });
    state.numScenes += 1;
  },
  deleteScene(state, payload) {
    Vue.set(state.scenes, payload.sceneId, { id: payload.sceneId, props: null });

    // Update frame if necessary
    // TODO: improve this to use a counter instead
    const currFrame =
      state.frames[state.frameList[state.frameList.findIndex(id => state.frames[id].scenes.includes(payload.sceneId))]];

    Vue.set(state.frames, currFrame.id, { ...currFrame, size: currFrame.size - 1 });
    state.numScenes -= 1;
  },
  copyScene(state, payload) {
    Vue.set(state.scenes, payload.toId, { ...state.scenes[payload.fromId], id: payload.toId });
  },
  bindScene(state, payload) {
    const parent = state.scenes[payload.fromId];
    const child = state.scenes[payload.toId];
    // Setup the parent being bound to, set parents reference counter
    const bound = parent.bound ? parent.bound + 1 : 0;
    Vue.set(state.scenes, payload.fromId, { ...state.scenes[payload.fromId], bound });
    // Set the child binding
    Vue.set(state.scenes, payload.toId, { id: child.id, props: parent.id });
  },
  unbindScene(state, payload) {
    // FIXME: move logic to actions make one addScene func
    const parentProps = { ...state.scenes[payload.toId].props };
    Vue.set(state.scenes, payload.fromId, { id: payload.fromId, props: parentProps });
  },
  swapScene(state, payload) {
    const swappedScene = { ...state.scenes[payload.idList[1]], ...{ id: payload.idList[0] } };
    Vue.set(state.scenes, payload.idList[1], { ...state.scenes[payload.idList[0]], id: payload.idList[1] });
    Vue.set(state.scenes, payload.idList[0], swappedScene);
  },
  setScenePropsKey(state, payload) {
    const newProps = { ...state.scenes[payload.sceneId].props, ...payload.entry };
    Vue.set(state.scenes, payload.sceneId, { ...state.scenes[payload.sceneId], props: newProps });
  },
  setSceneValidity(state, payload) {
    const sceneProps = state.scenes[payload.sceneId].props;
    Vue.set(state.scenes, payload.sceneId, {
      id: payload.sceneId,
      valid: payload.valid,
      props: sceneProps
    });
  }
};
