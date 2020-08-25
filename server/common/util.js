const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const bcrypt = require('bcrypt');

const UserModel = require('../models/UserModel');

/**** Global Constants ****/
const assetTypes = ['clip', 'actor', 'foreground', 'background', 'cache'];
const saltRounds = 10;

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
        return obj.permitAdmin;

    } catch (err) {
        console.log(err);
        return false;
    }
}

async function userPermissions(user_id) {
    try {
        const obj = await UserModel.findById(user_id);
        return {
            permitAdmin: obj.permitAdmin,
            permitHosting: obj.permitHosting
        };

    } catch (err) {
        console.log(err);
        return {
            permitAdmin: false,
            permitHosting: false
        };
    }
}

async function verifyPassword(user, byName, password) {
    try {
        const obj =  byName
            ? await UserModel.findOne({username: user}) 
            : await UserModel.findById(user);

        if (!obj)
            return false;

        if (!bcrypt.compareSync(password, obj.password))
            return false;

        return obj;
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
    return path.join(os.tmpdir(), 'sim-prev' , `sim-${sim_id}`);
}

function simTmpZipPath(options, sim_id) {
    return path.join(os.tmpdir(), 'sim-prev' , `sim-${sim_id}.zip`);
}

function simServDir(options, sim_id) {
    return path.join(options.config.sim_serve_dir, `sim-${sim_id}`);
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
    assetTypes,
    saltRounds,
    success,
    failure,
    multipleReplace,
    userIsAdmin,
    userPermissions,
    userDir,
    simTmpDir,
    simTmpZipPath,
    simServDir,
    fileMultipleReplace,
    verifyPassword
};