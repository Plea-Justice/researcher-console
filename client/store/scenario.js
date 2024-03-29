/* Copyright (C) 2021 The Plea Justice Project
 *
 * Please see https://pleajustice.org for information about this project's
 * licensing and how you can make a contribution.
 */

/* eslint no-shadow: ["error", { "allow": ["state", "getters"] }] */

import { nanoid } from 'nanoid/non-secure';

const initialState = () => ({
  id: '',
  numScenes: 0,
  meta: {
    name: '',
    description: '',
    citation: '',
    survey: '',
    live: '',
    public: false,
    readOnly: false,
    version: ''
  },
  tagSetList: [],
  tagSets: {},
  tags: {},
  conditionList: [],
  conditions: {},
  frameList: [],
  frames: {},
  scenes: {},
  assetList: [],
  status: {
    valid: true,
    // Tracks errors related to `frames`
    // Note: doesn't have hierarchy (doesn't track errors for scenes inside of frame)
    //       only errors related to itself
    frameErrors: [],
    // Tracks errors related to `scenes`
    sceneErrors: []
  }
});

export const state = () => initialState();

export const getters = {
  scenarioMeta: state => ({ id: state.id, ...state.meta }),
  conditionSet: state => state.conditionList.map(conditionId => state.conditions[conditionId]),
  tagSets: state =>
    state.tagSetList.map(setId => ({
      ...state.tagSets[setId],
      tags: state.tagSets[setId].tags.map(tagId => state.tags[tagId])
    })),
  assetList: state => state.assetList,
  tagsSet: state => tagIds => tagIds.map(id => state.tags[id]),
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
  updateMeta({ commit, dispatch }, meta) {
    commit('updateMeta', { meta });
    dispatch('saveMeta');
  },
  updateFrameErrors({ commit }, { valid, id }) {
    commit('setFrameErrors', { valid, id });
    commit('updateScenarioValidity');
  },
  updateSceneErrors({ commit }, { valid, id }) {
    commit('setSceneErrors', { valid, id });
    commit('updateScenarioValidity');
  },
  updateAssetList({ commit }, { assetList }) {
    commit('setAssetList', { assetList });
  },
  addTagSet({ commit }, { name }) {
    commit('newTagSet', { id: nanoid(), name });
  },
  addTag({ commit }, { setId, name }) {
    commit('newTag', { setId, tag: { id: nanoid(), name } });
  },
  removeTag({ state, commit }, { setId, tagId }) {
    commit('deleteTag', { setId, tagId, tagIndex: state.tagSets[setId].tags.findIndex(id => id === tagId) });
  },

  // **** Condition Actions ****
  addCondition({ commit, dispatch, state, getters }) {
    commit('newCondition');

    const conditionIndex = state.conditionList.length - 1;
    // TODO: async this
    getters.frameSet.forEach(frame => {
      dispatch('addScene', frame.scenes[conditionIndex]);
    });
  },
  removeCondition({ commit, dispatch, state }, id) {
    const isLast = state.conditionList.length <= 1;
    const index = state.conditionList.indexOf(id);

    if (!isLast) {
      // TODO: async this
      const sceneIds = state.frameList.map(frameId => state.frames[frameId].scenes[index]);
      sceneIds.forEach(sceneId => dispatch('removeScene', sceneId));
    }

    commit('deleteCondition', { index, isLast });

    if (isLast) {
      dispatch('addCondition');
      dispatch('addFrame');
    }
  },
  async copyConditions({ dispatch, state, getters }, idList) {
    const indexList = idList.map(id => state.conditionList.indexOf(id));

    // TODO: async this
    getters.frameSet.forEach(({ scenes }) => {
      const sceneIdList = indexList.map(index => scenes[index]);
      dispatch('copyScenes', sceneIdList);
    });
  },
  updateConditionTags({ commit }, { conditionId, tags }) {
    commit('setConditionTags', { conditionId, tags });
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
  addScene({ commit, dispatch, state, getters }, id) {
    const frameId = state.frameList[getters.frameSet.findIndex(({ scenes }) => scenes.includes(id))];
    const frame = state.frames[frameId];
    const prevSceneIdx = frame.scenes.indexOf(id) - 1;
    const prevScene = prevSceneIdx >= 0 ? state.scenes[frame.scenes[prevSceneIdx]] : undefined;

    if (prevScene?.props) {
      commit('setScene', { id, scene: { id, props: null } });
      dispatch('bindScenes', [prevScene.id, id]);
    } else {
      commit('setScene', { id, scene: { id, props: {} } });
    }

    commit('updateSceneCount', { modifier: 1, frameId });
  },
  removeScene({ commit, dispatch, state, getters }, id) {
    // Handle scene if bound parent: unbind & remove all children
    const boundScenes = state.scenes[id]?.bound;
    if (boundScenes > 0) {
      const frame = state.frames[state.frameList.find(frameId => state.frames[frameId].scenes.includes(id))];
      const offset = frame.scenes.indexOf(id) + 1;
      const childIds = frame.scenes.slice(offset, offset + boundScenes);
      // TODO: async this
      childIds.forEach(childId => {
        dispatch('unbindScene', { id: childId, parentId: id });
        dispatch('removeScene', childId);
      });
    } else if (typeof state.scenes[id].props === 'string') {
      // Handle scene if bound child: decrement bound parents counter
      const frame = state.frames[state.frameList.find(frameId => state.frames[frameId].scenes.includes(id))];
      const childIndex = frame.scenes.indexOf(id);
      const sceneIds = frame.scenes.slice(0, childIndex).reverse();

      // TODO: async this
      for (const sceneId of sceneIds) {
        if (state.scenes[sceneId].bound >= 0) {
          dispatch('unbindScene', { id, parentId: sceneId });
          break;
        }
      }
    }

    if (state.scenes[id].props !== null) {
      // TODO: add a way to do deletion directly instead of depending on conditions & frames?
      commit('setScene', { id, scene: { id, props: null } });
      const frameId = state.frameList[getters.frameSet.findIndex(({ scenes }) => scenes.includes(id))];
      commit('updateSceneCount', { modifier: -1, frameId });
      // unset scene error if removed scene was invalid
      dispatch('updateSceneErrors', { id, valid: true });
    }
  },
  updateScene({ commit, dispatch }, { id, valid, props }) {
    commit('setSceneProps', {
      id,
      // If object create a copy, otherwise pass flat value
      props: typeof props === 'object' && props !== null ? { ...props } : props
    });
    dispatch('updateSceneErrors', { id, valid });
  },
  copyScenes({ commit, state }, [parentId, ...childIds]) {
    childIds.forEach(id => commit('setScene', { id, scene: { ...state.scenes[parentId], id } }));
  },
  bindScenes({ commit, dispatch, state, getters }, [parentId, ...childIds]) {
    let parent = state.scenes[parentId];

    // If the parent is bound too, find an unbound ancestor.
    while (typeof parent.props === 'string') {
      parent = state.scenes[parent.props];
    }

    // Get the frame in which scenes are being bound.
    const refFrame = getters.frameSet.find(frame => frame.scenes.includes(parent.id));

    // Determine if the parent is to the left of all children.
    let unorderedId = false;
    for (const id of refFrame.scenes) {
      if (id === parent.id) break;
      else if (childIds.includes(id)) {
        unorderedId = id;
        break;
      }
    }

    // Update parent's bound reference counter
    const valid = !state.status.sceneErrors.includes(parent.id);
    commit('setScene', {
      id: parent.id,
      scene: {
        ...parent,
        bound: parent.bound ? parent.bound + childIds.length : childIds.length
      }
    });

    // Update children to reference parentId.
    childIds.forEach(id =>
      dispatch('updateScene', {
        id,
        valid,
        props: parent.id
      })
    );

    // If the parent is not the leftmost, swap with the leftmost chid so that it is.
    if (unorderedId) {
      dispatch('swapScene', [parent.id, unorderedId]);
    }
  },
  unbindScene({ commit, dispatch, state }, { id, parentId }) {
    const childId = id;
    const parent = state.scenes[parentId];

    // Update children with parent's props & status
    dispatch('updateScene', {
      id: childId,
      valid: !state.status.sceneErrors.includes(parentId),
      props: { ...parent.props }
    });

    // FIXME: when .bound hits 0 remove the property
    // Update parent's bound reference counter
    commit('setScene', { id: parentId, scene: { ...parent, bound: parent.bound - 1 } });
  },
  swapScene({ commit, state }, [id1, id2]) {
    // TODO: Splice swap references directly instead of resetting objects
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
  updateMeta(state, { meta }) {
    this._vm.$set(state, 'meta', { ...state.meta, ...meta });
  },
  updateSceneCount(state, { modifier, frameId }) {
    state.numScenes += modifier;
    const frame = state.frames[frameId];
    this._vm.$set(state.frames, frameId, { ...frame, size: (frame.size += modifier) });
  },
  updateScenarioValidity(state) {
    const hasErrors = state.status.sceneErrors.length || state.status.frameErrors.length;
    // if no errors, update valid key
    if (state.status.valid && hasErrors) {
      this._vm.$set(state.status, 'valid', false);
    } else if (!state.status.valid && !hasErrors) {
      this._vm.$set(state.status, 'valid', true);
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
  setAssetList(state, { assetList }) {
    this._vm.$set(state, 'assetList', assetList);
  },
  newTagSet(state, { id, name }) {
    this._vm.$set(state.tagSets, id, { id, name, tags: [] });
    state.tagSetList.push(id);
  },
  newTag(state, { setId, tag }) {
    this._vm.$set(state.tags, tag.id, tag);
    state.tagSets[setId].tags.push(tag.id);
  },
  deleteTag(state, { setId, tagId, tagIndex }) {
    state.tagSets[setId].tags.splice(tagIndex, 1);
    this._vm.$delete(state.tags, tagId);
  },

  // **** Condition Mutations ****
  newCondition(state) {
    const id = nanoid();
    this._vm.$set(state.conditions, id, { id, tags: [], customizations: {} });
    state.conditionList.push(id);

    // Copy last condition into new condition
    state.frameList.forEach(frameId => {
      const frame = state.frames[frameId];

      // Create new scene & add to frame
      const sceneId = nanoid();
      this._vm.$set(state.scenes, sceneId, { id: sceneId, props: null });
      // TODO: fix these being direct mutations?
      frame.scenes.push(sceneId);
    });
  },
  deleteCondition(state, { id, index, isLast }) {
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
        const removedSceneId = currFrame.scenes.splice(index, 1);

        // Remove scene from scenes
        this._vm.$delete(state.scenes, removedSceneId);
      });
    }

    state.conditionList.splice(index, 1);
    this._vm.$delete(state.conditions, id);
  },
  setConditionTags(state, { conditionId, tags }) {
    // this._vm.$set(state.conditions[conditionId], 'tags', tags);
    this._vm.$set(state.conditions, conditionId, { ...state.conditions[conditionId], tags });
  },

  // **** Frame Mutations ****
  newFrame(state, { index, id, frame }) {
    // Create frame
    this._vm.$set(state.frames, id, frame);
    state.frameList.splice(index, 0, id);
  },
  deleteFrame(state, { id }) {
    const frame = state.frames[id];

    // Remove scenes in frame
    state.frames[id].scenes.forEach(sceneId => this._vm.$delete(state.scenes, sceneId));

    // Update scene count
    state.numScenes -= frame.size;

    // Remove frame
    state.frameList.splice(state.frameList.indexOf(id), 1);
    this._vm.$delete(state.frames, id);
  },
  setFrameProp(state, { id, key, value }) {
    this._vm.$set(state.frames[id], key, value);
  },
  moveFrame(state, { id, modifier }) {
    const fromIndex = state.frameList.indexOf(id);
    const toIndex = fromIndex + modifier;

    // Swap 2 frames using splice
    state.frameList.splice(fromIndex, 1, state.frameList.splice(toIndex, 1, id)[0]);
  },

  // **** Scene Mutations ****
  // FIXME: mark this as an unprotected mutation, use least possible
  setScene(state, { id, scene }) {
    this._vm.$set(state.scenes, id, scene);
  },
  setSceneProps(state, { id, props }) {
    // Update scene
    this._vm.$set(state.scenes, id, { ...state.scenes[id], props });
  }
};
