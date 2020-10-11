/* eslint no-shadow: ["error", { "allow": ["state", "getters"] }] */
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';
// FIXME: use this.$set

import { nanoid } from 'nanoid/non-secure';

const initialState = () => ({
  id: '',
  numScenes: 0,
  meta: {
    name: '',
    description: '',
    survey: '',
    live: '',
    public: false,
    readOnly: false,
    version: ''
  },
  conditions: {},
  conditionList: [],
  frames: {},
  frameList: [],
  scenes: {},
  status: {
    valid: false,
    // Tracks errors related to `frames`
    // Note: doesn't have hierarchy (doesn't track errors for scenes inside of frame)
    //       only errors related to itself
    frameErrors: [],
    // Tracks errors related to `scenes`
    sceneErrors: [],
    dirty: 0
  }
});

export const state = () => initialState();

export const getters = {
  scenarioMeta: state => ({ id: state.id, ...state.meta }),
  conditionSet: state => state.conditionList.map(id => state.conditions[id]),
  frameSet: state => state.frameList.map(frameId => state.frames[frameId]),
  sceneSet: state => frameId => state.frames[frameId].scenes.map(sceneId => state.scenes[sceneId]),
  numScenes: state => state.numScenes,
  status: state => state.status
};

export const actions = {
  // **** Axios Actions ****
  async getScenario({ commit, dispatch, state }, id) {
    const response = await this.$axios.$get(`/api/v1/scenarios/${id}`);
    if (response.success) {
      // Reset state representation write in data from server request
      commit('resetState');
      commit('setScenario', response.result);

      // If new Scenario (completely empty) create an initial condition & frame
      if (!state.frameList.length) {
        dispatch('addCondition');
        dispatch('addFrame');
      }
    }
  },
  async saveScenario({ state }) {
    await this.$axios.$put(`/api/v1/scenarios/${state.id}`, state);
  },
  async saveMeta({ state }) {
    await this.$axios.$put(`/api/v1/scenarios/${state.id}`, { meta: state.meta });
  },

  // **** Scenario Actions ****
  updateMeta({ commit }, meta) {
    commit('updateMeta', { meta });
  },
  updateFrameErrors({ commit }, { valid, id }) {
    commit('setFrameErrors', { valid, id });
    commit('updateScenarioValidity');
  },
  updateSceneErrors({ commit }, { valid, id }) {
    commit('setSceneErrors', { valid, id });
    commit('updateScenarioValidity');
  },

  // **** Condition Actions ****
  addCondition({ commit }) {
    commit('newCondition');
  },
  removeCondition({ commit, dispatch, state }, id) {
    const isLast = state.conditionList.length <= 1;
    const index = state.conditionList.indexOf(id);
    commit('deleteCondition', { index, isLast });

    if (isLast) {
      dispatch('addCondition');
      dispatch('addFrame');
    }
  },
  async copyConditions({ dispatch, state, getters }, idList) {
    const indexList = idList.map(id => state.conditionList.indexOf(id));

    // FIXME: async this
    getters.frameSet.forEach(({ scenes }) => {
      const sceneIdList = indexList.map(index => scenes[index]);
      dispatch('copyScenes', sceneIdList);
    });
  },
  updateTags({ commit }, { id, tags }) {
    commit('setTags', { id, tags });
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
  removeFrame({ commit, dispatch, state }, id) {
    const frame = state.frames[id];

    if (state.frameList.length <= 1) {
      // If last frame simply replace scenes with empty scenes
      // TODO: this can be async
      frame.scenes.forEach(sceneId => {
        commit('setScene', { id: sceneId, scene: { id: sceneId, props: null } });
        dispatch('updateSceneErrors', { id: sceneId, valid: true });
      });
      commit('updateSceneCount', { modifier: -frame.size, frameId: id });
    } else {
      // Otherwise delete frame & it's scenes
      frame.scenes.forEach(sceneId => dispatch('updateSceneErrors', { id: sceneId, valid: true }));
      commit('deleteFrame', { id });
    }
    // unset frame error if removed frame was invalid
    dispatch('updateFrameErrors', { id, valid: true });
  },
  moveFrameDown({ commit }, id) {
    // Frame stack goes from 0 down incrementally, so add 1 to move down
    commit('moveFrame', { id, modifier: 1 });
  },
  moveFrameUp({ commit }, id) {
    // Frame stack goes from 0 down incrementally, so add -1 to move up
    commit('moveFrame', { id, modifier: -1 });
  },
  setFrameLabel({ commit, dispatch }, { id, value, valid }) {
    dispatch('updateFrameErrors', { id, valid });
    commit('setFrameProp', { id, key: 'label', value });
  },

  // **** Scene Actions ****
  addScene({ commit, state, getters }, id) {
    const frameId = state.frameList[getters.frameSet.findIndex(({ scenes }) => scenes.includes(id))];
    const frame = state.frames[frameId];
    const prevSceneIdx = frame.scenes.indexOf(id) - 1;
    const prevScene = prevSceneIdx >= 0 ? state.scenes[frame.scenes[prevSceneIdx]] : undefined;

    const newProps = prevScene && prevScene.props !== null ? { ...prevScene.props } : {};

    commit('setScene', { id, scene: { id, props: newProps } });
    commit('updateSceneCount', { modifier: 1, frameId });
  },
  removeScene({ commit, dispatch, state, getters }, id) {
    commit('setScene', { id, scene: { id, props: null } });
    const frameId = state.frameList[getters.frameSet.findIndex(({ scenes }) => scenes.includes(id))];
    commit('updateSceneCount', { modifier: -1, frameId });
    // unset scene error if removed scene was invalid
    dispatch('updateSceneErrors', { id, valid: true });
  },
  updateScene({ commit }, { valid, id, props }) {
    commit('setSceneProps', { valid, id, props: { ...props } });
  },
  copyScenes({ commit, state }, [parentId, ...childIds]) {
    childIds.forEach(id => commit('setScene', { id, scene: { ...state.scenes[parentId], id } }));
  },
  bindScenes({ commit, state }, [parentId, ...childIds]) {
    const parent = state.scenes[parentId];
    // TODO: Update key directly?
    // Update parent's bound reference counter
    commit('setScene', { id: parent.id, scene: { ...parent, bound: parent.bound ? parent.bound + 1 : 0 } });

    // Update children to reference parentId
    childIds.forEach(id => commit('setScene', { id, scene: { id, props: parent.id } }));
  },
  unbindScene({ commit, state }, { id, props }) {
    const childId = id;
    const parentId = props;
    const parent = state.scenes[parentId];

    // FIXME: be careful with validity, since goal is to update props might be better to use setSceneProps?
    // Update children with parent's props
    commit('setScene', { id: childId, scene: { id: childId, props: { ...parent.props } } });

    // Update parent's bound reference counter
    commit('setScene', { id: parentId, scene: { ...parent, bound: parent.bound - 1 } });
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
  updateSceneCount(state, { modifier, frameId }) {
    state.numScenes += modifier;
    const frame = state.frames[frameId];
    Vue.set(state.frames, frameId, { ...frame, size: (frame.size += modifier) });
  },
  updateScenarioValidity(state) {
    const hasErrors = state.status.sceneErrors.length || state.status.frameErrors.length;
    // if no errors, update valid key
    if (state.status.valid && hasErrors) {
      Vue.set(state.status, 'valid', false);
    } else if (!state.status.valid && !hasErrors) {
      Vue.set(state.status, 'valid', true);
    }
  },
  setFrameErrors(state, { valid, id }) {
    // If valid and was prev invalid, remove flag
    const errorIndex = state.status.frameErrors.indexOf(id);
    if (valid && errorIndex !== -1) {
      state.status.frameErrors.splice(errorIndex, 1);
    } else if (!valid && errorIndex === -1) {
      // If invalid and not flagged, flag
      state.status.frameErrors.push(id);
    }
  },
  setSceneErrors(state, { valid, id }) {
    const errorIndex = state.status.sceneErrors.indexOf(id);
    if (valid && errorIndex !== -1) {
      state.status.sceneErrors.splice(errorIndex, 1);
    } else if (!valid && errorIndex === -1) {
      state.status.sceneErrors.push(id);
    }
  },

  // **** Condition Mutations ****
  newCondition(state) {
    const id = nanoid();
    Vue.set(state.conditions, id, { id, tags: [] });
    state.conditionList.push(id);

    // Copy last condition into new condition
    state.frameList.forEach(frameId => {
      const currFrame = state.frames[frameId];
      const prevScene = state.scenes[currFrame.scenes[currFrame.scenes.length - 1]];

      const sceneId = nanoid();
      Vue.set(state.scenes, sceneId, { ...prevScene, id: sceneId });
      // TODO: fix these being direct mutations?
      currFrame.scenes.push(sceneId);

      // TODO: use updateCount?
      if (prevScene.props !== null) {
        Vue.set(currFrame, 'size', currFrame.size + 1);
        state.numScenes += 1;
      }
    });
  },
  deleteCondition(state, { index, id, isLast }) {
    if (isLast) {
      // If last Condition reset all conditions, frames, and scenes
      state.frameList = [];
      state.frames = {};
      state.scenes = {};
      state.numScenes = 0;
    } else {
      state.frameList.forEach(frameId => {
        const currFrame = state.frames[frameId];
        // Remove that conditions scene's from each frame
        // TODO: fix this being a direct mutation?
        const removedSceneId = currFrame.scenes.splice(index, 1);
        // Update frame size
        if (state.scenes[removedSceneId].props !== null) {
          Vue.set(currFrame, 'size', currFrame.size - 1);
          state.numScenes -= 1;
        }
        // Remove scene from scenes
        Vue.delete(state.scenes, removedSceneId);
      });
    }

    state.conditionList.splice(index, 1);
    Vue.delete(state.conditions, id);
  },
  setTags(state, { id, tags }) {
    Vue.set(state.conditions[id], 'tags', tags);
  },

  // **** Frame Mutations ****
  newFrame(state, { index, id, frame }) {
    // Create frame
    Vue.set(state.frames, id, frame);
    state.frameList.splice(index, 0, id);
  },
  deleteFrame(state, { id }) {
    const frame = state.frames[id];

    // Remove scenes in frame
    state.frames[id].scenes.forEach(sceneId => Vue.delete(state.scenes, sceneId));

    // Update scene count
    state.numScenes -= frame.size;

    // Remove frame
    state.frameList.splice(state.frameList.indexOf(id), 1);
    Vue.delete(state.frames, id);
  },
  setFrameProp(state, { id, key, value }) {
    Vue.set(state.frames[id], key, value);
  },
  moveFrame(state, { id, modifier }) {
    const fromIndex = state.frameList.indexOf(id);
    const toIndex = fromIndex + modifier;

    // Swap 2 frames using splice
    state.frameList.splice(fromIndex, 1, state.frameList.splice(toIndex, 1, id)[0]);
  },

  // **** Scene Mutations ****
  setScene(state, { id, scene }) {
    Vue.set(state.scenes, id, scene);
  },
  setSceneProps(state, payload) {
    const { id, props } = payload;
    // Mark dirty and start working
    Vue.set(state.status, 'dirty', state.status.dirty + 1);

    // If invalid scene add to scenario errors, otherwise update errors if scene was previously invalid
    if (!payload.valid && !state.status.sceneErrors.includes(id)) {
      Vue.set(state.status, 'errors', [...state.status.sceneErrors, id]);
    } else {
      const index = state.status.sceneErrors.indexOf(id);
      if (index !== -1) state.status.sceneErrors.splice(index, 1);
    }

    const hasErrors = state.status.sceneErrors.length || state.status.frameErrors.length;
    // if no errors, update valid key
    if (state.status.valid && hasErrors) {
      Vue.set(state.status, 'valid', false);
    } else if (!state.status.valid && !hasErrors) {
      Vue.set(state.status, 'valid', true);
    }

    // Update scene
    Vue.set(state.scenes, id, { ...state.scenes[id], props });
    Vue.set(state.status, 'dirty', state.status.dirty - 1);
  }
};
