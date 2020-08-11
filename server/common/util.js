const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const UserModel = require('../models/UserModel');

/**** Request/Response Objects ****/

function success(message, result) {
    return {
        success: true,
        message: message || '',
        result: result || null
    };
}

function failure(message, result) {
    return {
        success: false,
        message: message || '',
        result: result || null
    };
}

/**** Database Related Functions ****/

async function userIsAdmin(user_id) {
    try {
        let obj = await UserModel.findById(user_id);
        return obj.administrator;

    } catch (err) {
        console.log(err);
        return false;
    }
}

/**** Filesystem Functions ****/

function userDir(options, user_id) {
    return path.join(options.config.data_dir, user_id);
}

function simTmpDir(options, sim_id) {
    return path.join(os.tmpdir(), 'sim-serve' , `sim-${sim_id}`);
}

function simTmpZipPath(options, sim_id) {
    return path.join(os.tmpdir(), 'sim-serve' , `sim-${sim_id}.zip`);
}

module.exports = {success, failure, userIsAdmin, userDir, simTmpDir, simTmpZipPath};