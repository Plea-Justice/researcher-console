/* Copyright (C) 2021 The Plea Justice Project
 *
 * Please see https://pleajustice.org for information about this project's
 * licensing and how you can make a contribution.
 */

/* mocha */
/*global describe, it */

// const assert = require('assert');
const supertest = require('supertest');
const cookie = require('cookie');
const archetype = require('./archetype');
const validate = require('./validate');

const request = supertest('http://localhost:3000');
const base = '/api/v1';


let session_cookie = '';
const variables = {};

describe('Version 1 API Endpoints', function () {

    it('login', function (done) {
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

    it('get user information', function (done) {
        request
            .get(`${base}/auth/user`)
            .set('cookie', session_cookie)
            .accept('application/json')
            .expect(200)
            .expect('content-type', /application\/json/)
            .expect(validate.Response)
            .expect(validate.User)
            .expect((res) => variables['user'] = res.body.result)
            .end(done);
    });

    /* Scenarios */
    it('get user\'s scenario list', function (done) {
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

    it('create scenario', function (done) {
        request
            .post(`${base}/scenarios`)
            .set('cookie', session_cookie)
            .accept('application/json')
            .send(archetype.ScenarioMeta)
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect(validate.Response)
            .expect(validate.ScenarioMeta)
            .expect((res) => variables['scenarioid'] = res.body.result.id)
            .end(done);
    });

    it('check scenario list', function (done) {
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

    it('get scenario', function (done) {
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


    it('copy scenario', function (done) {
        request
            .post(`${base}/scenarios/${variables['scenarioid']}`)
            .set('cookie', session_cookie)
            .accept('application/json')
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect(validate.Response)
            .expect(validate.ScenarioMeta)
            .expect((res) => variables['scenariocopyid'] = res.body.result.id)
            .end(done);
    });

    it('delete scenario', function (done) {
        request
            .delete(`${base}/scenarios/${variables['scenarioid']}`)
            .set('cookie', session_cookie)
            .accept('application/json')
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect(validate.Response)
            .then(()=>{
                request
                    .delete(`${base}/scenarios/${variables['scenariocopyid']}`)
                    .set('cookie', session_cookie)
                    .accept('application/json')
                    .expect(200)
                    .expect('Content-Type', /application\/json/)
                    .expect(validate.Response)
                    .end(done);
            });


    });


    /* Assets */
    it('get asset list', function (done) {
        request
            .get(`${base}/assets`)
            .set('cookie', session_cookie)
            .accept('application/json')
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect(validate.Response)
            .expect(validate.AssetList)
            .end(done);
    });

    it('upload asset', function (done) {
        this.timeout(10000);
        request
            .post(`${base}/assets`)
            .set('cookie', session_cookie)
            .accept('application/json')
            .attach('file', './testing/upload.png')
            .field('type', 'background')
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect(validate.Response)
            .expect(validate.Asset)
            .expect((res) => variables['asset'] = res.body.result)
            .end(done);
    });

    it('delete asset', function (done) {
        request
            .delete(`${base}/assets/${variables['asset'].id}`)
            .set('cookie', session_cookie)
            .accept('application/json')
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect(validate.Response)
            .end(done);
    });


    /* Logout */
    it('logout', function (done) {
        request
            .post(`${base}/auth/logout`)
            .set('cookie', session_cookie)
            .accept('application/json')
            .expect(200)
            .expect('content-type', /application\/json/)
            .end(done);
    });

    it('check logged out', function (done) {
        request
            .get(`${base}/auth/user`)
            .set('cookie', session_cookie)
            .accept('application/json')
            .expect(401)
            .expect('Content-Type', /application\/json/)
            .expect(validate.Response)
            .end(done);
    });

});
