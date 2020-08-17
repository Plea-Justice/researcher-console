/* eslint no-shadow: ["error", { "allow": ["state", "getters"] }] */
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
  conditions: {},
  conditionList: [],
  frames: {},
  frameList: [],
  scenes: {},
  // FIXME: fix parent valid prop (it doesn't get updated)
  status: {
    valid: false,
    errors: [],
    dirty: 0
  }
});

export const state = () => initialState();

export const getters = {
  scenarioMeta: state => ({ id: state.id, ...state.meta }),
  conditionSet: state => state.conditionList.map(id => state.conditions[id]),
  frameSet: state => state.frameList.map(frameId => state.frames[frameId]),
  sceneSet: state => frameId => state.frames[frameId].scenes.map(sceneId => state.scenes[sceneId]),
  numConditions: state => (state.frameList.length ? state.frames[state.frameList[0]].scenes.length : 0),
  numScenes: state => state.numScenes,
  errors: state => state.status.errors
};

export const actions = {
  // **** Axios Actions ****
  async getScenario({ commit, dispatch, state }, id) {
    const response = await this.$axios.$get(`/api/v1/scenarios/${id}`);
    if (response.success) {
      // Reset state representation write in data from server request
      commit('resetState');
      commit('setScenario', response.result);

      // If new new Scenario (no frames exists) create an initial frame
      if (!state.frameList.length) dispatch('addFrame');
    }
  },
  async saveScenario({ state }) {
    await this.$axios.$put(`/api/v1/scenarios/${state.id}`, state);
  },

  // **** Scenario Actions ****
  updateMeta({ commit }, meta) {
    commit('updateMeta', { meta });
  },

  // **** Condition Actions ****
  addCondition({ commit }) {
    commit('newCondition');
  },
  removeCondition({ commit, dispatch, state }, id) {
    const isLast = state.frames[state.frameList[0]].scenes.length <= 1;
    const index = state.conditionList.indexOf(id);
    commit('deleteCondition', { index, isLast });

    if (state.frameList.length === 0) dispatch('addFrame');
  },
  async copyConditions({ dispatch, getters }, indexList) {
    // FIXME: async this
    getters.frameSet.forEach(({ scenes }) => {
      const idList = indexList.map(index => scenes[index]);
      dispatch('copyScenes', idList);
    });
  },
  async swapCondition({ dispatch, getters }, [index1, index2]) {
    // FIXME: async this
    getters.frameSet.forEach(({ scenes }) => {
      dispatch('swapScene', [scenes[index1], scenes[index2]]);
    });
  },

  // **** Frame Actions ****
  addFrame({ commit, state }, frameId = null) {
    const framesLength = state.frameList.length ? state.frames[state.frameList[0]].scenes.length : 1;
    const scenes = Array.from(Array(framesLength), () => nanoid());
    scenes.forEach(id => commit('setScene', { id, scene: { id, props: null } }));

    const id = nanoid();
    commit('newFrame', {
      index: frameId ? state.frameList.indexOf(frameId) + 1 : 0,
      id,
      frame: { id, size: 0, label: '', scenes }
    });
  },
  removeFrame({ commit }, frameId) {
    // If last frame reset all scenes
    // if (state.frameList.length === 1) state.frames[frameId].scenes.forEach(id => commit('setScene'));

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
  setFrameLabel({ commit }, { id, value }) {
    commit('updateFrame', { id, key: 'label', value });
  },

  // **** Scene Actions ****
  addScene({ commit }, sceneId) {
    commit('newScene', { sceneId });
  },
  removeScene({ commit }, sceneId) {
    commit('deleteScene', { sceneId });
  },
  updateScene({ commit }, { id, props, valid }) {
    commit('setSceneProps', { id, props: { ...props }, valid });
  },
  copyScenes({ commit, state }, [parentId, ...childIds]) {
    childIds.forEach(id => commit('setScene', { id, scene: { ...state.scenes[parentId], id } }));
  },
  bindScenes({ commit }, idList) {
    commit('bindScene', { fromId: idList[0], toId: idList[1] });
  },
  unbindScene({ commit }, { id, props }) {
    commit('unbindScene', { fromId: id, toId: props });
  },
  swapScene({ commit, state }, [id1, id2]) {
    // Splice frame instead?
    const scene1 = { ...state.scenes[id1], id: id2 };
    commit('setScene', { id: id1, scene: { ...state.scenes[id2], id: id1 } });
    commit('setScene', { id: id2, scene: scene1 });
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
    const id = nanoid();
    Vue.set(state.conditions, id, { tags: ['new'] });
    state.conditionList.push(id);

    // Copy last condition into new condition
    state.frameList.forEach(frameId => {
      const currFrame = state.frames[frameId];
      const lastScene = state.scenes[currFrame.scenes[currFrame.scenes.length - 1]];

      const sceneId = nanoid();
      Vue.set(state.scenes, sceneId, { ...lastScene, id: sceneId });
      // FIXME: fix these being direct mutations?
      currFrame.scenes.push(sceneId);

      if (lastScene.props !== null) {
        Vue.set(currFrame, 'size', currFrame.size + 1);
        state.numScenes += 1;
      }
    });
  },
  deleteCondition(state, { index, id, isLast }) {
    if (isLast) {
      // If last Condition reset all frames and scenes
      state.frameList = [];
      state.frames = {};
      state.scenes = {};
      state.numScenes = 0;
    } else {
      state.frameList.forEach(frameId => {
        // Remove that conditions scene's from each frame
        // FIXME: fix this being a direct mutation?
        const removedSceneId = state.frames[frameId].scenes.splice(index, 1);
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

    state.conditionList.splice(index, 1);
    Vue.delete(state.conditions, id);
  },

  // **** Frame Mutations ****
  newFrame(state, { index, id, frame }) {
    // Create frame
    Vue.set(state.frames, id, frame);
    state.frameList.splice(index, 0, id);
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
  updateFrame(state, { id, key, value }) {
    Vue.set(state.frames[id], key, value);
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

    Vue.set(state.scenes, payload.sceneId, { id: payload.sceneId, props: newSceneProps });
    // TODO: Can you reactively update a key instead of replacing everything else?
    Vue.set(state.frames, currFrame.id, { ...currFrame, size: currFrame.size + 1 });
    state.numScenes += 1;
  },
  deleteScene(state, payload) {
    Vue.set(state.scenes, payload.sceneId, { id: payload.sceneId, props: null });

    // Update frame if necessary
    const currFrame =
      state.frames[state.frameList[state.frameList.findIndex(id => state.frames[id].scenes.includes(payload.sceneId))]];

    Vue.set(state.frames, currFrame.id, { ...currFrame, size: currFrame.size - 1 });
    state.numScenes -= 1;
  },
  setScene(state, { id, scene }) {
    Vue.set(state.scenes, id, scene);
  },
  setSceneProps(state, payload) {
    const { id, props } = payload;
    // Mark dirty and start working
    Vue.set(state.status, 'dirty', state.status.dirty + 1);

    // If invalid scene add to scenario errors, otherwise update errors if scene was previously invalid
    if (!payload.valid && !state.status.errors.includes(id)) {
      Vue.set(state.status, 'errors', [...state.status.errors, id]);
    } else {
      const index = state.status.errors.indexOf(id);
      if (index !== -1) state.status.errors.splice(index, 1);
    }

    // Update scene
    Vue.set(state.scenes, id, { ...state.scenes[id], props });
    Vue.set(state.status, 'dirty', state.status.dirty - 1);
  },
  bindScene(state, payload) {
    const parent = state.scenes[payload.fromId];
    const child = state.scenes[payload.toId];
    // Setup the parent being bound to, set parents reference counter
    const bound = parent.bound ? parent.bound + 1 : 0;
    // FIXME: either fix reference or use setScene
    Vue.set(state.scenes, payload.fromId, { ...state.scenes[payload.fromId], bound });
    // Set the child binding
    Vue.set(state.scenes, payload.toId, { id: child.id, props: parent.id });
  },
  unbindScene(state, payload) {
    // FIXME: move logic to actions make one addScene func
    const parentProps = { ...state.scenes[payload.toId].props };
    Vue.set(state.scenes, payload.fromId, { id: payload.fromId, props: parentProps });
  }
};
