/**
 * Configuration for researcher-console backend.
 */

module.exports = {
    // Server settings. 
    port: 3000,
    host: 'locahost',

    // API.
    api_definition: './routes/api_v1',
    api_mount_point: '/api/v1',

    // Logging.
    keep_logs: '1d',
    log_dir: 'log',

    // Location of static client files.
    client_dir: '../client/dist'
};