const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const bcrypt = require('bcrypt');

const UserModel = require('../models/UserModel');

/**** Global Constants ****/
const assetTypes = {
    // FIXME: Deprecate this and move globals to a more appropriate file.
    types: ['clip', 'actor', 'foreground', 'background'],
    spec: {
        'clip': ['.js'],
        'actor': ['.js'],
        'background': ['.js'],
        'foreground': ['.js']
    }
};
const saltRounds = 10;

/**** Request/Response Objects ****/

function success(message, result) {
    return {
        success: true,
        message: message || '',
        result: result || {}
    };
}

function failure(message, result) {
    return {
        success: false,
        message: message || '',
        result: result || {}
    };
}

/**** Text Operations ****/

function multipleReplace(string, replacements) {
    for (const [regex, newstr] of replacements)
        string = string.replace(regex, newstr);
    return string;
}

const atob = (src) => Buffer.from(src, 'base64').toString('binary');
const btoa = (src) => Buffer.from(src, 'binary').toString('base64');

/**** Database Related Functions ****/

async function userIsAdmin(id) {
    try {
        let obj = await UserModel.findById(id);
        return obj.permitAdmin;

    } catch (err) {
        console.log(err);
        return false;
    }
}

async function userPermissions(id) {
    try {
        const obj = await UserModel.findById(id);
        return {
            permitAdmin: obj.permitAdmin,
            permitHosting: obj.permitHosting,
            permitSharing: obj.permitSharing,
            permitUploads: obj.permitUploads
        };

    } catch (err) {
        console.log(err);
        return {
            permitAdmin: false,
            permitHosting: false,
            permitSharing: false,
            permitUploads: false
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

function userDir(options, id) {
    return path.join(options.user_dir, id);
}

function simTmpDir(options, sim_id) {
    return path.join(os.tmpdir(), 'sim-prev' , `sim-${sim_id}`);
}

function simTmpZipPath(options, sim_id) {
    return path.join(os.tmpdir(), 'sim-prev' , `sim-${sim_id}.zip`);
}

function simServDir(options, sim_id) {
    return path.join(options.sim_serve_dir, `sim-${sim_id}`);
}

function fileMultipleReplace(file, replacements) {
    try {
        let string = fs.readFileSync(file, 'utf-8');
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
    atob,
    btoa,
    userIsAdmin,
    userPermissions,
    userDir,
    simTmpDir,
    simTmpZipPath,
    simServDir,
    fileMultipleReplace,
    verifyPassword
};