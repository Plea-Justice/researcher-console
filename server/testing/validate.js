/* Copyright (C) 2021 The Plea Justice Project
 *
 * Please see https://pleajustice.org for information about this project's
 * licensing and how you can make a contribution.
 */

const Ajv = require('ajv');
const ajv = new Ajv();
const schema = require('./schema');

const responseValidator = ajv.compile(schema.Response);
const objectIdValidator = ajv.compile(schema.ObjectId);
const userValidator = ajv.compile(schema.User);
const scenarioValidator = ajv.addSchema(schema.ScenarioMeta).compile(schema.Scenario);
const scenarioMetaValidator = ajv.compile(schema.ScenarioMeta);
const scenarioListValidator = ajv.compile(schema.ScenarioList);
const assetValidator = ajv.compile(schema.Asset);
const assetListValidator = ajv.compile(schema.AssetList);

module.exports = {

    Response: function (res) {
        if (responseValidator(res.body))
            return;
        throw Error(responseValidator.errors[0].message);
    },

    ObjectId: function (res) {
        if (objectIdValidator(res.body.result))
            return;
        throw Error(objectIdValidator.errors[0].message);
    },

    User: function (res) {
        if (userValidator(res.body.result))
            return;
        throw Error(userValidator.errors[0].message);
    },

    Scenario:  function (res) {
        if (scenarioValidator(res.body.result))
            return;
        throw Error(scenarioValidator.errors[0].message);
    },

    ScenarioMeta:  function (res) {
        if (scenarioMetaValidator(res.body.result))
            return;
        throw Error(scenarioMetaValidator.errors[0].message);
    },

    ScenarioList: function (res) {
        if (scenarioListValidator(res.body.result))
            return;
        throw Error(scenarioListValidator.errors[0].message);
    },

    Asset: function (res) {
        if (assetValidator(res.body.result))
            return;
        throw Error(assetValidator.errors[0].message);
    },

    AssetList: function (res) {
        if (assetListValidator(res.body.result))
            return;
        throw Error(assetListValidator.errors[0].message);
    }


};
