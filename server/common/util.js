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

module.exports = {success, failure};