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

/**** Text Operations ****/

function multipleReplace(string, replacements) {
    for (const [regex, newstr] of replacements)
        string = string.replace(regex, newstr);
    return string;
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

function fileMultipleReplace(file, replacements) {
    try {
        let string = fs.readFileSync(file, 'utf-8');
        console.log(string);
        string = multipleReplace(string, replacements);
        fs.writeFileSync(file, string);
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    success,
    failure,
    multipleReplace,
    userIsAdmin,
    userDir,
    simTmpDir,
    simTmpZipPath,
    fileMultipleReplace
};