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

function posixTimeToHoursAgo(milliseconds) {
    let time = Date.now() - milliseconds;
    time *= 1 / (1000 * 60 * 60);

    return time;
}

module.exports = {success, failure, posixTimeToHoursAgo};