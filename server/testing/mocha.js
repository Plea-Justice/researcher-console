/* mocha */
/*global describe, it */

// const assert = require('assert');
const supertest = require('supertest');
const cookie = require('cookie');
const archetype = require('./archetype');
const validate = require('./validate');

const request = supertest('http://localhost:3000');
const base = '/api/v1';


var session_cookie = '';
var variables = {};

describe('Version 1 API Endpoints', function () {

    it('POST login', function (done) {
        request
            .post(`${base}/auth/login`)
            .send(archetype.Credentials)
            .expect(200)
            .expect('content-type', /application\/json/)
            .expect('set-cookie', /connect.sid/)
            .then(res => {
                session_cookie = res.get('set-cookie')[0];
                variables['sessionid'] = cookie.parse(session_cookie)['connect.sid'];
                done();
            });
    });

    it('GET user', function (done) {
        request
            .get(`${base}/auth/user`)
            .set('cookie', session_cookie)
            .accept('application/json')
            .expect(200)
            .expect('content-type', /application\/json/)
            .expect(validate.Response)
            .expect(validate.User)
            .expect((res) => variables['user'] = res.body.result.user)
            .end(done);
    });

    it('GET scenarios', function (done) {
        request
            .get(`${base}/scenarios`)
            .set('cookie', session_cookie)
            .accept('application/json')
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect(validate.Response)
            .expect(validate.ScenarioList)
            .end(done);
    });

    it('POST scenarios', function (done) {
        request
            .post(`${base}/scenarios`)
            .set('cookie', session_cookie)
            .accept('application/json')
            .send(archetype.ScenarioMeta)
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect(validate.Response)
            .expect(validate.ObjectId)
            .expect((res) => variables['scenarioid'] = res.body.result.id)
            .end(done);
    });

    it('check scenario meta returned', function (done) {
        request
            .get(`${base}/scenarios`)
            .set('cookie', session_cookie)
            .accept('application/json')
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect(validate.Response)
            .expect(validate.ScenarioList)
            .end(done);
    });

    it('GET scenario', function (done) {
        request
            .get(`${base}/scenarios/${variables['scenarioid']}`)
            .set('cookie', session_cookie)
            .accept('application/json')
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect(validate.Response)
            .expect(validate.Scenario)
            .end(done);
    });

    it('DELETE scenario', function (done) {
        request
            .delete(`${base}/scenarios/${variables['scenarioid']}`)
            .set('cookie', session_cookie)
            .accept('application/json')
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect(validate.Response)
            .end(done);
    });

});