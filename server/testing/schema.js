/* Copyright (C) 2021 The Plea Justice Project
 *
 * Please see https://pleajustice.org for information about this project's
 * licensing and how you can make a contribution.
 */

module.exports = {

    ObjectId: {
        $id: 'org.pleajustice.server.db.id',
        type: 'string',
        minLength: 24,
        maxLength: 24
    },

    Response: {
        $id: 'org.pleajustice.server.response',
        type: 'object',
        properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            result: { type: 'object' }
        },
        minProperties: 3,
        additionalProperties: false
    },

    User: {
        $id: 'org.pleajustice.user',
        type: 'object',
        properties: {

            id: { $ref: 'org.pleajustice.server.db.id' },
            name: { type: 'string' },

            fullname: { type: 'string' },
            email: { type: 'string', pattern: '^\\w*?@\\w+\\.[\\w\\.]*\\w$' },
            profession: { type: 'string' },
            affiliation: { type: 'string' },
            addresses: { type: 'array', items: { type: 'string', pattern: '^(([a-f\\d]{0,4}[:\\.-]){2,3}[a-f\\d]{1,4})+$' } },
            sessions: { type: 'integer' },

            permitAdmin: { type: 'boolean' },
            permitHosting: { type: 'boolean' },
            permitSharing: { type: 'boolean' },
            permitUploads: { type: 'boolean' },

            lastActive: { type: 'string', format: 'date-time' },

            created: { type: 'string', format: 'date-time' },
            modified: { type: 'string', format: 'date-time' },
            version: { type: 'string', pattern: '^\\d\\.\\d\\.\\d+$' }
        },
        patternProperties: {
            '^permit': { type: 'boolean' }
        },
        minProperties: 16,
        additionalProperties: false
    },

    Scenario: {
        $id: 'org.pleajustice.scenario.scenario',
        type: 'object',
        properties: {
            id: { $ref: 'org.pleajustice.server.db.id' },
            meta: { $ref: 'org.pleajustice.scenario.meta' },
            frameList: { type: 'array', items: { type: 'string' } },
            frames: { type: 'object' },
            conditionList: { type: 'array', items: { type: 'string' } },
            conditions: { type: 'object' },
            tagSetList: { type: 'array', items: { type: 'string' } },
            tagSets: { type: 'object' },
            tags: { type: 'object' },
            assetList: { type: 'array', items: { $ref: 'org.pleajustice.server.db.id' } },
            numScenes: { type: 'integer' },
            scenes: { type: 'object' },
            status: { type: 'object' }  // TODO: Sensible default.
        },
        minProperties: 11,
        additionalProperties: false

    },

    ScenarioMeta: {
        $id: 'org.pleajustice.scenario.meta',
        type: 'object',
        properties: {
            id: { $ref: 'org.pleajustice.server.db.id' },
            name: { type: 'string' },
            owner: { type: 'string' },
            author: { type: 'string' },
            description: { type: 'string' },
            citation: { type: 'string' },
            public: { type: 'boolean' },
            survey: { type: 'string' },
            live: { type: 'string' },
            readOnly: { type: 'boolean' },
            created: { type: 'string', format: 'date-time' },
            modified: { type: 'string', format: 'date-time' },
            version: { type: 'string', pattern: '^\\d\\.\\d\\.\\d+$' }
        },
        minProperties: 13, // FIXME: 14 for author
        additionalProperties: false
    },

    ScenarioList: {
        $id: 'org.pleajustice.scenario.list',
        type: 'object',
        properties: {
            scenarioList: { type: 'array', items: { type: 'string' } },
            scenarios: { type: 'object', additionalProperties: { $ref: 'org.pleajustice.scenario.meta' } }
        },
        minProperties: 2,
        additionalProperties: false
    },

    Asset: {
        $id: 'org.pleajustice.asset.asset',
        type: 'object',
        properties: {
            id: { $ref: 'org.pleajustice.server.db.id' },
            name: { type: 'string' },
            description: { type: 'string' },
            citation: { type: 'string' },
            type: { type: 'string' },
            path: { type: 'string' },
            owner: { type: 'string' },
            author: { type: 'string' },
            public: { type: 'boolean' },
            readOnly: { type: 'boolean' },
            created: { type: 'string', format: 'date-time' },
            modified: { type: 'string', format: 'date-time' },
            customizables: { type: 'array', items: { type: 'object' } },
            version: { type: 'string', pattern: '^\\d\\.\\d\\.\\d+$' }
        },
        minProperties: 13,  // FIXME: 14 for author
        additionalProperties: false

    },

    AssetList: {
        $id: 'org.pleajustice.asset.list',
        type: 'object',
        properties: {
            assetTypeSpecs: { type: 'object' },
            // FIXME: Deprecate this.
            assetTypes: { type: 'array', items: { type: 'string' } },
            assetList: { type: 'array', items: { type: 'string' } },
            assets: { type: 'object', additionalProperties: { $ref: 'org.pleajustice.asset.asset' } }
        },
        minProperties: 4,
        additionalProperties: false
    },
};
