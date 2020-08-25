/* eslint no-shadow: ["error", { "allow": ["state", "getters"] }] */
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';

import { nanoid } from 'nanoid/non-secure';

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

  // **** Scenario Actions ****
  updateMeta({ commit }, meta) {
    commit('updateMeta', { meta });
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
  removeFrame({ commit, state }, id) {
    if (state.frameList.length <= 1) {
      // If last frame simply replace scenes with empty scenes
      const frame = state.frames[id];
      frame.scenes.forEach(sceneId => commit('setScene', { id: sceneId, scene: { id: sceneId, props: null } }));
      commit('updateSceneCount', { modifier: -frame.size, frameId: id });
    } else {
      // Otherwise delete frame & it's scenes
      commit('deleteFrame', { id });
    }
  },
  moveFrameDown({ commit }, id) {
    // Frame stack goes from 0 down incrementally, so add 1 to move down
    commit('moveFrame', { id, modifier: 1 });
  },
  moveFrameUp({ commit }, id) {
    // Frame stack goes from 0 down incrementally, so add -1 to move up
    commit('moveFrame', { id, modifier: -1 });
  },
  setFrameLabel({ commit }, { id, value }) {
    commit('updateFrame', { id, key: 'label', value });
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
  removeScene({ commit, state, getters }, id) {
    commit('setScene', { id, scene: { id, props: null } });
    const frameId = state.frameList[getters.frameSet.findIndex(({ scenes }) => scenes.includes(id))];
    commit('updateSceneCount', { modifier: -1, frameId });
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

    // FIXME: be careful with validity, since goal is to update props might be better to use updateSceneProps?
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
  updateFrame(state, { id, key, value }) {
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
    if (!payload.valid && !state.status.errors.includes(id)) {
      Vue.set(state.status, 'errors', [...state.status.errors, id]);
    } else {
      const index = state.status.errors.indexOf(id);
      if (index !== -1) state.status.errors.splice(index, 1);
    }

    // Update scene
    Vue.set(state.scenes, id, { ...state.scenes[id], props });
    Vue.set(state.status, 'dirty', state.status.dirty - 1);
  }
};
