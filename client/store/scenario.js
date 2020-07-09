/* eslint no-shadow: ["error", { "allow": ["state"] }] */
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';

// FIXME: remove where not needed
import { nanoid } from 'nanoid/non-secure';

// FIXME: make this a build time asset based on spec.json instead of using all of spec directly
// Lazy load/code-split this?
import spec from '../assets/spec.json';

export const state = () => ({
  id: '',
  name: '',
  frames: {},
  frameList: [],
  scenes: {}
});

export const getters = {
  scenarioMeta: state => ({
    id: state.id,
    name: state.name
  }),
  frameSet: state => state.frameList.map(frameId => state.frames[frameId]),
  sceneSet: state => frameId => state.frames[frameId].scenes.map(sceneId => state.scenes[sceneId]),
  numConditions: state => (state.frameList.length <= 0 ? 0 : state.frames[state.frameList[0]].scenes.length),
  getFrameIndex: state => frameId => state.frameList.indexOf(frameId)
};

export const actions = {
  // Axios based actions
  async getScenario({ commit }, id) {
    // FIXME: allow this to capture any scenario
    const response = await this.$axios.$get(`/api/v1/s/${id}`);

    commit('setScenario', response.return);
  },
  saveScenario({ commit }) {
    commit('putScenario');
  },
  // Standard operations/actions
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
  },
  // Form Based Actions
  updateSceneType({ commit }, { id, value }) {
    commit('setSceneFormVal', { sceneId: id, entry: { type: value } });
  },
  updateSceneForm({ commit }, { id, key, val }) {
    commit('setSceneFormVal', { sceneId: id, entry: { [key]: val } });
  },
  setSceneValid({ commit }, sceneId) {
    commit('setSceneValidity', { sceneId, valid: true });
  },
  setSceneInvalid({ commit }, sceneId) {
    commit('setSceneValidity', { sceneId, valid: false });
  }
};

export const mutations = {
  setScenario(state, scenario) {
    state.id = scenario._id;
    state.name = scenario.name;

    // FIXME: make this static or something?
    const skeletonScene = Object.fromEntries(Object.keys(spec.scene).map(key => [key, null]));

    state.scenes = Object.fromEntries(
      Object.entries(scenario.vuex_state.scenes).map(([key, values]) => [
        key,
        {
          id: values.id,
          valid: null,
          type: values.props.type || Object.keys(spec.sceneTypes)[0],
          props: { ...skeletonScene, ...values.props }
        }
      ])
    );

    state.frames = scenario.vuex_state.frames;
    state.frameList = scenario.vuex_state.frameList;
  },
  putScenario(state, id) {
    // FIXME: REMOVE DEBUG
    console.table(
      state.frameList.flatMap(frameId =>
        state.frames[frameId].scenes.map(sceneId => {
          const scene = state.scenes[sceneId];
          return !!scene.valid;
        })
      )
    );

    this.$axios.$put(`/api/v1/s/${id}`, {
      _id: id,
      name: state.name,
      vuex_state: {
        scenes: state.scenes,
        frames: state.frames,
        frameList: state.frameList
      }
    });
  },
  newCondition(state) {
    const numConditions = state.frameList.length <= 0 ? 0 : state.frames[state.frameList[0]].scenes.length;

    // Copy last condition into new condition
    for (let i = 0; i < numConditions; i++) {
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
      Vue.set(state.frames, frameId, { id: frameId, blank: true, scenes: [sceneId] });
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
      Vue.set(state.scenes, id, { id, valid: null, dirty: true, props: null });
      frameScenes[i] = id;
    }

    const id = nanoid();
    Vue.set(state.frames, id, { id, blank: true, scenes: frameScenes });
    state.frameList.splice(frameIndex, 0, id);
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
  newScene(state, payload) {
    // TODO: better default scene?
    const newScene = spec.scene;
    newScene.name = 'Default Scene';

    Vue.set(state.scenes, payload.sceneId, { id: payload.sceneId, valid: null, dirty: true, props: newScene });
  },
  deleteScene(state, payload) {
    Vue.set(state.scenes, payload.sceneId, { id: payload.sceneId, props: null });
  },
  setSceneFormVal(state, payload) {
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
