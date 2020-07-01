/* eslint no-shadow: ["error", { "allow": ["state"] }] */
import Vue from 'vue'; // eslint-disable-line import/no-extraneous-dependencies

// FIXME: fix nanoid warning
import { nanoid } from 'nanoid/non-secure';

// FIXME: make this a build time asset based on spec.json instead of using all of spec directly
// Lazy load/code-split this?
import defaultScene from '../assets/spec.json';

export const state = () => ({
  id: '',
  title: '',
  conditionLengths: [],
  frames: {},
  frameList: [],
  scenes: {}
});

export const getters = {
  scenarioMeta: state => ({
    id: state.id,
    title: state.title
  }),
  frameSet: state => state.frameList.map(frameId => state.frames[frameId]),
  sceneSet: state => frameId => state.frames[frameId].scenes.map(sceneId => state.scenes[sceneId]),
  numConditions: state => state.conditionLengths.length,
  getFrameIndex: state => frameId => state.frameList.indexOf(frameId),
  isBlank: state => sceneId => state.scenes[sceneId].props === null
};

export const actions = {
  async getScenario({ commit }, id) {
    // FIXME: allow this to capture any scenario
    const response = await this.$axios.$get(`/api/v1/s/${id}`);

    commit('setScenario', response.return);
  },
  saveScenario({ commit }, id) {
    commit('putScenario', id);
  },
  addCondition({ commit }) {
    commit('newCondition', { id: nanoid() });
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
  addFrame({ commit }, frameId) {
    commit('newFrame', { frameId });
  },
  removeFrame({ commit }, frameId) {
    commit('deleteFrame', { frameId });
  },
  addScene({ commit }, sceneId) {
    commit('newScene', { sceneId });
  },
  removeScene({ commit }, sceneId) {
    commit('deleteScene', { sceneId });
  }
};

export const mutations = {
  setScenario(state, scenario) {
    state.id = scenario._id;
    state.title = scenario.title;
    state.conditionLengths = scenario.vuex_state.conditionLengths;
    state.scenes = scenario.vuex_state.scenes;
    state.frames = scenario.vuex_state.frames;
    state.frameList = scenario.vuex_state.frameList;
  },
  putScenario(state, id) {
    this.$axios.$put(`/api/v1/s/${id}`, {
      _id: id,
      title: state.title,
      vuex_state: {
        conditionLengths: state.conditionLengths,
        scenes: state.scenes,
        frames: state.frames,
        frameList: state.frameList
      }
    });
  },
  newCondition(state, payload) {
    const firstFrame = state.frames[state.frameList[0]];

    // Update condition lengths
    state.conditionLengths.push(1);

    // Create new scene for condition in first frame
    Vue.set(state.scenes, payload.id, { id: payload.id, props: defaultScene.scene });
    firstFrame.scenes.push(payload.id);
  },
  deleteCondition(state, payload) {
    state.frameList.forEach(frameId => {
      // Remove that conditions scene's from each frame
      const removedSceneId = state.frames[frameId].scenes.splice(payload.index, 1);

      // Remove scene from scenes
      Vue.delete(state.scenes, removedSceneId);
    });

    // Update conditionLengths
    state.conditionLengths.splice(payload.index, 1);
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
  newFrame(state, payload) {
    // Inserting into next position, so get next index
    const frameIndex = state.frameList.indexOf(payload.frameId) + 1;

    // FIXME: improve this
    const frameScenes = Array(state.frames[payload.frameId].scenes.length);
    for (let i = 0; i < frameScenes.length; i++) {
      const id = nanoid();
      Vue.set(state.scenes, id, { id, props: null });
      frameScenes[i] = id;
    }

    const id = nanoid();
    Vue.set(state.frames, id, { id, scenes: frameScenes });
    state.frameList.splice(frameIndex, 0, id);
  },
  deleteFrame(state, payload) {
    const frameIndex = state.frameList.indexOf(payload.frameId);

    // If last frame replace scenes with empty scenes
    if (state.frameList.length === 1) {
      state.frames[payload.frameId].scenes.forEach(sceneId =>
        Vue.set(state.scenes, sceneId, { id: sceneId, props: null })
      );
    } else {
      // Otherwise remove frame
      state.frameList.splice(frameIndex, 1);
      Vue.delete(state.frames, payload.frameId);
    }
  },
  newScene(state, payload) {
    // FIXME: remove frameId from scenes
    // FIXME: be more conservative with defaultScene
    Vue.set(state.scenes, payload.sceneId, { id: payload.sceneId, props: defaultScene.scene });
  },
  deleteScene(state, payload) {
    Vue.set(state.scenes, payload.sceneId, { id: payload.sceneId, props: null });
  }
};