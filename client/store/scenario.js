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
    survey: '',
    collapsed: false
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
    this.$axios.$get(`/api/v1/s/${id}`).then(response => {
      if (response.success) {
        // Reset state representation write in data from server request
        commit('resetState');
        commit('setScenario', response.result);

        // If new new Scenario (has no frames) add an initial frame
        if (!state.frameList.length) commit('newFrame');
      }
    });
  },
  saveScenario({ commit }) {
    // FIXME: make this a promise so saving errors can be properly reported?
    commit('putScenario');
  },

  // **** Scenario Actions ****
  // FIXME: deprecate "updateMetaKey"
  updateMetaKey({ commit }, { key, val }) {
    commit('updateMetaKey', { key, val });
  },
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
  updateFrame({ commit }, { id, key, val }) {
    commit('setFrameKey', { frameId: id, entry: { [key]: val } });
  },
  updateFrames({ commit }, { key, val }) {
    commit('setFramesKey', { entry: { [key]: val } });
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
    state.id = scenario.meta.id;
    state.numScenes = scenario.numScenes;
    state.meta = { name: scenario.meta.name, description: scenario.meta.description, survey: scenario.meta.survey };

    // FIXME: make this static or something?
    const emptySceneProps = {
      ...Object.fromEntries(Object.keys(spec.scene).map(key => [key, ''])),
      type: Object.keys(spec.sceneTypes)[1]
    };

    state.scenes = Object.fromEntries(
      Object.entries(scenario.vuex_state.scenes).map(([key, values]) => [
        key,
        {
          id: values.id,
          valid: null,
          type: values.props ? values.props.type || Object.keys(spec.sceneTypes)[1] : false,
          props: { ...emptySceneProps, ...values.props }
        }
      ])
    );

    // FIXME: Should add properties to each frame as well or does server-side gurantee this
    state.frames = scenario.vuex_state.frames;
    state.frameList = scenario.vuex_state.frameList;
  },
  putScenario(state) {
    // FIXME: REMOVE DEBUG
    /* console.table(
      state.frameList.flatMap(frameId =>
        state.frames[frameId].scenes.map(sceneId => {
          const scene = state.scenes[sceneId];
          return !!scene.valid;
        })
      )
    ); */

    this.$axios.$put(`/api/v1/s/${state.id}`, {
      name: state.meta.name,
      description: state.meta.description,
      survey: state.meta.survey,
      vuex_state: {
        scenes: state.scenes,
        frames: state.frames,
        frameList: state.frameList
      }
    });
  },

  // **** Scenario Mutations ****
  updateMetaKey(state, payload) {
    Vue.set(state.meta, payload.key, payload.val);
  },
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
      Vue.set(state.frames, frameId, { id: frameId, size: 0, collapsed: false, scenes: [sceneId] });
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
    Vue.set(state.frames, id, { id, size: 0, collapsed: false, scenes: frameScenes });
    if (payload && state.frameList.length) state.frameList.splice(state.frameList.indexOf(payload.frameId) + 1, 0, id);
    else state.frameList.push(id);
  },
  deleteFrame(state, payload) {
    // If last frame just replace scenes with empty scenes
    if (state.frameList.length <= 1) {
      const lastFrame = state.frames[payload.frameId];

      lastFrame.scenes.forEach(sceneId => Vue.set(state.scenes, sceneId, { id: sceneId, props: null }));

      // Update Frame data
      Vue.set(state.frames, payload.frameId, { ...lastFrame, size: 0 });
    } else {
      const frameIndex = state.frameList.indexOf(payload.frameId);

      // Remove scenes in frame
      state.frames[payload.frameId].scenes.forEach(sceneId => Vue.delete(state.scenes, sceneId));

      // Remove frame
      state.frameList.splice(frameIndex, 1);
      Vue.delete(state.frames, payload.frameId);
    }
  },
  setFrameKey(state, payload) {
    const frame = state.frames[payload.frameId];
    Vue.set(state.frames, payload.frameId, { ...frame, ...payload.entry });
  },
  setFramesKey(state, payload) {
    state.frameList.forEach(frameId => {
      const frame = state.frames[frameId];
      Vue.set(state.frames, frameId, { ...frame, ...payload.entry });
    });
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

    // If prev scene has props use those, otherwise create default props list
    // FIXME: make this static or something?
    const newSceneProps = prevSceneProps || {
      ...Object.fromEntries(Object.keys(spec.scene).map(key => [key, ''])),
      type: Object.keys(spec.sceneTypes)[1]
    };

    Vue.set(state.scenes, payload.sceneId, { id: payload.sceneId, valid: null, props: newSceneProps });
    // FIXME: Can you reactively update a key instead of replacing everything else?
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
    Vue.set(state.scenes, payload.toId, { ...state.scenes[payload.fromId], ...{ id: payload.toId } });
  },
  swapScene(state, payload) {
    const swappedScene = { ...state.scenes[payload.idList[1]], ...{ id: payload.idList[0] } };
    Vue.set(state.scenes, payload.idList[1], { ...state.scenes[payload.idList[0]], ...{ id: payload.idList[1] } });
    Vue.set(state.scenes, payload.idList[0], swappedScene);
  },
  setScenePropsKey(state, payload) {
    const newProps = { ...state.scenes[payload.sceneId].props, ...payload.entry };
    Vue.set(state.scenes, payload.sceneId, { ...state.scenes[payload.sceneId], ...{ props: newProps } });
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
