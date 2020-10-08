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
            success: {type: 'boolean'},
            message: {type: 'string'},
            result: {type: 'object'}
        },
        required: ['success', 'message', 'result'],
        additionalProperties: false
    },

    User: {
        $id: 'org.pleajustice.user',
        type: 'object',
        properties: {
            name: {type: 'string'},
            user_id: { $ref: 'org.pleajustice.server.db.id' },  // TODO: Rename this 'id'.
            sessions: {type: 'integer'},
        },
        patternProperties: {
            '^permit': {type: 'boolean'}
        },
        required: ['name', 'user_id', 'sessions'],
        additionalProperties: false
    },

    Scenario: {
        $id: 'org.pleajustice.scenario.scenario',
        type: 'object',
        properties: {
            id: { $ref: 'org.pleajustice.server.db.id' },
            meta: { $ref: 'org.pleajustice.scenario.meta' },
            frameList: { type: 'array', items: { type: 'string' }},
            frames: { type: 'object' }
        },
        required: ['meta', 'frameList', 'frames']

    },

    ScenarioMeta: {
        $id: 'org.pleajustice.scenario.meta',
        type: 'object',
        properties: {
            id: { $ref: 'org.pleajustice.server.db.id' },
            name: {type: 'string'},
            description: {type: 'string'},
            public: {type: 'boolean'},
            survey: {type: 'string'},
            live: {type: 'string'},
            readOnly: {type: 'boolean'},
            created: {type: 'string', format: 'date-time'},
            modified: {type: 'string', format: 'date-time'},
            version: {type: 'string', pattern: '^\\d\\.\\d\\.\\d+$'}
        },
        required: ['id', 'name', 'description'],
        additionalProperties: false
    },

    ScenarioList: {
        $id: 'org.pleajustice.scenario.list',
        type: 'object',
        properties: {
            scenarioList: { type: 'array', items: { type: 'string' }},
            scenarios: { type: 'object', additionalProperties: { $ref: 'org.pleajustice.scenario.meta' }}
        }
    },
};