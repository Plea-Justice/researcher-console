# `testing/`

This directory contains basic unit tests for the first version the server's API. Use `npm run test` to check new changes and ensure backward compatibility. The tests utilize [`mocha`](https://mochajs.org/), [`supertest`](https://www.npmjs.com/package/supertest), and [`ajv`](https://www.npmjs.com/package/ajv) to validate each response against a JSON schema.

| File | Description |
|-|-|
| `mocha.js` | Main file containing the tests. |
| `schema.js` | JSON schema specifying v1 server responses. |
| `validate.js` | Defines object validation functions. |
| `archetype.js` | Example data to test with. |
| `upload.png` | Example file to test asset uploads. |
