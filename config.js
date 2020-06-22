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

    // MongoDB Settings
    // Switch this to a different database for development.
    mongo_uri: 'mongodb://localhost:27017/researcher',

    // Data directory for uploaded assets and user files.
    data_dir: 'data/',

    // Maximum upload size in MiB.
    max_upload_mb: 20,

    // Secret for signing session id cookies.
    // This should be random, non-guessable, and replaced with a new string for production.
    session_secret: '371fe6a5-ceed-4ce6-871c-ae28f4d837de',

    // Serve the client? (Boolean)
    serve_client: true,
    
    // Location of static client files.
    client_dir: 'client/dist'
};