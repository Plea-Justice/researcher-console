/* eslint no-shadow: ["error", { "allow": ["state"] }] */
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';

// FIXME: remove where not needed
import { nanoid } from 'nanoid/non-secure';

// FIXME: make this a build time asset based on spec.json instead of using all of spec directly
// Lazy load/code-split this?
import spec from '../assets/spec.json';

const initialState = () => ({
  id: '',
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
  numConditions: state => (state.frameList.length <= 0 ? 0 : state.frames[state.frameList[0]].scenes.length)
};

export const actions = {
  // **** Axios Actions ****
  async getScenario({ commit, state: currState }, id) {
    // FIXME: allow this to capture any scenario

    const response = await this.$axios.$get(`/api/v1/s/${id}`);

    // Reset state representation write in data from server request
    commit('resetState');
    commit('setScenario', response.return);

    // If new new Scenario (has no frames) add an initial frame
    if (!currState.frameList.length) commit('newFrame');
  },
  saveScenario({ commit }) {
    // FIXME: make this a promise so saving errors can be properly reported?
    commit('putScenario');
  },

  // **** Scenario Actions ****
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
    commit('copyCondition', { fromIndex: indexList[0] - 1, toIndex: indexList[1] - 1 });
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
  // Form Actions
  updateSceneType({ commit }, { id, value }) {
    commit('updateSceneProps', { sceneId: id, entry: { type: value } });
  },
  updateSceneForm({ commit }, { id, key, val }) {
    commit('setScenePropsKey', { sceneId: id, entry: { [key]: val } });
  },
  // FIXME: finish these
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
    state.id = scenario._id;

    state.meta = { name: scenario.name, description: scenario.description, survey: scenario.survey };

    // FIXME: make this static or something?
    const emptySceneProps = {
      ...Object.fromEntries(Object.keys(spec.scene).map(key => [key, ''])),
      name: 'Default Scene',
      type: Object.keys(spec.sceneTypes)[1]
    };

    state.scenes = Object.fromEntries(
      Object.entries(scenario.vuex_state.scenes).map(([key, values]) => [
        key,
        {
          id: values.id,
          valid: null,
          type: values.props.type || Object.keys(spec.sceneTypes)[0],
          props: { ...emptySceneProps, ...values.props }
        }
      ])
    );

    state.frames = scenario.vuex_state.frames;
    state.frameList = scenario.vuex_state.frameList;
  },
  putScenario(state) {
    // FIXME: REMOVE DEBUG
    console.table(
      state.frameList.flatMap(frameId =>
        state.frames[frameId].scenes.map(sceneId => {
          const scene = state.scenes[sceneId];
          return !!scene.valid;
        })
      )
    );

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
    console.log(payload.meta);

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
      currFrame.scenes.push(id);
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
      // Create new frame with new scene
      const frameId = nanoid();
      Vue.set(state.frames, frameId, { id: frameId, blank: true, collapsed: false, scenes: [sceneId] });
      state.frameList.push(frameId);
    } else {
      state.frameList.forEach(frameId => {
        // Remove that conditions scene's from each frame
        const removedSceneId = state.frames[frameId].scenes.splice(payload.index, 1);

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

  // **** Frame Mutations ****
  newFrame(state, payload) {
    // TODO: cache this in root VueX state, use cache for everywhere else as well
    const frameLength = state.frameList.length ? state.frames[state.frameList[0]].scenes.length : 1;

    // Create scenes for new frame
    const frameScenes = [];
    for (let i = 0; i < frameLength; i++) {
      const id = nanoid();
      Vue.set(state.scenes, id, { id, valid: null, props: null });
      frameScenes.push(id);
    }

    // Create frame
    const id = nanoid();
    Vue.set(state.frames, id, { id, blank: true, collapsed: false, scenes: frameScenes });
    if (payload && state.frameList.length) state.frameList.splice(state.frameList.indexOf(payload.frameId) + 1, 0, id);
    else state.frameList.push(id);
  },
  deleteFrame(state, payload) {
    // If last frame just replace scenes with empty scenes
    if (state.frameList.length <= 1) {
      const lastFrame = state.frames[payload.frameId];

      lastFrame.scenes.forEach(sceneId => Vue.set(state.scenes, sceneId, { id: sceneId, props: null }));

      // Update Frame data
      Vue.set(state.frames, payload.frameId, { ...lastFrame, ...{ blank: true } });
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

    // Swap the 2 frames with splice
    state.frameList.splice(toIndex, 0, state.frameList.splice(fromIndex, 1));
    // state.frameList.splice(fromIndex, 1, state.frameList.splice(toIndex, 1, payload.frameId)[0]);
  },

  // **** Scene Mutations ****
  newScene(state, payload) {
    // FIXME: make this static or something?

    const prevSceneProps = state.frameList.reduce((acc, id) => {
      const { scenes } = state.frames[id];
      const index = scenes.indexOf(payload.sceneId);
      return index > 0 ? Object.assign({}, state.scenes[scenes[index - 1]].props) : acc;
    }, null);

    // If prev scene has props use those, otherwise create default props list
    // FIXME: make this static or something?
    const newSceneProps = prevSceneProps || {
      ...Object.fromEntries(Object.keys(spec.scene).map(key => [key, ''])),
      name: 'Default Scene',
      type: Object.keys(spec.sceneTypes)[1]
    };

    Vue.set(state.scenes, payload.sceneId, { id: payload.sceneId, valid: null, props: newSceneProps });
  },
  deleteScene(state, payload) {
    Vue.set(state.scenes, payload.sceneId, { id: payload.sceneId, props: null });
  },
  copyScene(state, payload) {
    const copiedScene = { ...state.scenes[payload.fromId], ...{ id: payload.toId } };
    Vue.set(state.scenes, payload.toId, copiedScene);
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
