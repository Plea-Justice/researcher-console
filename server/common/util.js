const UserModel = require('../models/UserModel');

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

async function userIsAdmin(user_id) {
    try {
        let obj = await UserModel.findById(user_id);
        return obj.administrator;

    } catch (err) {
        console.log(err);
        return false;
    }
}

module.exports = {success, failure, userIsAdmin};