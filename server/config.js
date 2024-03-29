/**
 * Configuration for researcher-console backend.
 */

module.exports = {
    // Server settings.
    port: 3000,
    host: 'localhost',

    // Cross origin requests. Enable if server and client running separately.
    cors_enabled: true,
    cors_origin: 'http://localhost:3001',

    // Restrict cookies from being sent over unencrypted connections.
    secure_cookies: false,

    // When running behind a reverse proxy, trust X-Forwarded headers.
    trust_proxy: true,

    // API.
    api_definition: './routes/api_v1',
    api_mount_point: '/api/v1',

    // Logging.
    log_to_console: true,
    logs_enabled: true,
    keep_logs: '1d',
    log_dir: 'log',

    // MongoDB Settings
    // Switch this to a different database for development.
    mongo_uri: `mongodb://localhost:27017/${process.env.RESEARCHER_DB || 'researcher'}`,

    // Log debug info from Mongoose.
    mongoose_debug: false,

    // Data directory for uploaded assets and user files.
    user_dir: './data/user/',

    // Directory from which to serve live studies.
    sim_serve_dir: './data/simulations/',

    // Whether to copy a template to each user's data directory.
    assets_template: true,
    assets_dir: './data/default-assets/',

    // Location of the simulation template with simulation as toplevel index.html.
    sim_dir: '../../pleabargain-simulation/',

    // Maximum upload size in MiB.
    max_upload_mb: 20,

    // Secret for signing session id cookies.
    // This should be random, non-guessable, and replaced with a new string for production.
    session_secret: '371fe6a5-ceed-4ce6-871c-ae28f4d837de',

    // Serve the client? (Boolean)
    serve_client: false,

    // Location of static client files.
    client_dir: '../client/dist/',

    // Disable resource deletion or overwriting.
    noclobber: false,

    // Rate limit for login/logout.
    auth_attempts: 10,
    auth_minutes: 15,

    // Rate limit for new account registration.
    reg_attempts: 3,
    reg_minutes: 30
};
