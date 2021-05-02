# Plea Simulation Researcher Console

The researcher console is a web-based interface for configuring the [plea bargain simulation](https://github.com/Plea-Justice/pleabargain-simulation). A project overview and detailed documentation are available at [pleajustice.org](https://pleajustice.org).

## Dependencies and Installation

The researcher console primarily relies on [Node.js](https://nodejs.org/en/) and [MongoDB](https://www.mongodb.com/)..

A Unix platform is recommended. Development has been done under Ubuntu Server 20.04 with Node 14.14.0 and Mongo 4.4.5.

Node may be installed with [`nvm`](https://github.com/nvm-sh/nvm). Additional Node based software will be automatically installed by [`npm`](https://www.npmjs.com/).

The npm package, `cross-zip` requires the host system to support either the `zip` command or Windows Powershell. Note that `zip` must be manually installed on some Unix systems such as Ubuntu Server.

Running a live server on HTTP port `80` or with HTTPS on port `443` may require [reverse proxy](https://en.wikipedia.org/wiki/Reverse_proxy), especially if other sites must also be served on the same host. The [Nginx](https://nginx.org/) webserver supports reverse proxy. [Let's Encrypt's Certbot](https://certbot.eff.org/) can be used to obtain SSL certificates. Note that a webserver may impose restrictions such as upload file size limits that may interfere with the console. Check the software's manual for configuration options to lift such restrictions.

MongoDB is necessary to support the backend. After installing the database, start the Mongo service and set the URI of the database in `server/config.js`. By default, Mongo will run on port `27017`. The database may be given any name. No further configuration is needed, however it is recommended that the database is set up with credentials and that its port is not accessible from the network.

Once the appropriate dependencies are installed, clone the repository using the `--recurse-submodules` option (the server pulls in the [simulation](https://github.com/Plea-Justice/pleabargain-simulation) and [scripts](https://github.com/Plea-Justice/scripts) repositories as [Git submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules)). As described below, `cd` into and run `npm install` for both the `client/` and `server/` subdirectories. The client and server both use [`dotenv`](https://www.npmjs.com/package/dotenv) for certain configuration options such as the name of the Mongo database. Set `MODE=development` in each `.env` for additional debugging information. Edit (or create) and double check the configuration before starting a live server.

## Client

The console frontend is built with [Nuxt.js](https://nuxtjs.org), a higher level framework for [Vue.js](https://vuejs.org/). Vue components are from [Buefy](https://buefy.org/), based on the [Bulma](https://bulma.io/) CSS framework. [Axios](https://github.com/axios/axios) handles XHR requests to the server.

### Building the Frontend

```bash
# Switch to the client's directory.
$ cd client/

# Install dependencies.
$ npm install

# Configure client options.
$ vim nuxt.config.js
$ vim .env

# Serve the client for development with hot reload at localhost:3001.
$ npm run dev

# Build for production and serve just the client.
$ npm run build
$ npm run start

# Build static project for production and output to client/dist/.
# This Nuxt command changes frequently. Check the most recent docs.
$ npm run generate
```

Most configuration options are in `client/nuxt.config.js`. Double check build options, that the Axios `baseURL` points to the backend, and that the [`auth`](https://auth.nuxtjs.org/) middleware is enabled for authenticated routes.

Nuxt provides its own improved versions of many common packages as [modules](https://nuxtjs.org/guide/modules). These modules may have different options than the original packages (e.g. the [Axios](https://axios.nuxtjs.org/) module). Nuxt also provides [its own implementation](https://nuxtjs.org/guide/vuex-store/) of [Vuex](https://vuex.vuejs.org/) the Vue state management library, and configures other Vue features, such as [routes](https://nuxtjs.org/guide/routing/) automatically.

## Server

The application's backend is built with [Express](https://expressjs.com/en/api.html). It interfaces with MongoDB using [Mongoose](https://mongoosejs.com/). Filesystem interactions are performed using the [`fs-extra`](https://www.npmjs.com/package/fs-extra) package, an extension of Node's built in `fs` module that adds `async`/`await` functionality and recursive copy among other functions. [`express-session`](https://www.npmjs.com/package/express-session) handles user sessions, automatically issuing session cookies and tracking them in MongoDB.

### Running the Backend

```bash
# Switch to the server's directory.
$ cd server/

# Install dependencies.
$ npm install

# Configure server options.
$ vim config.js
$ vim .env

# Start the server for development with hot reload using nodemon.
$ npm run dev

# Start the server for production.
$ npm run start
```

Configuration is stored in `server/config.js`. In production, the client should be generated as a static site which the server can serve if enabled in this file. Make sure to define separate databases for development and production and select the appropriate database in this file or the `.env`. Additionally, make sure that any file path options point to their respective and desired locations on the host system. In production, set `session_secret` to a new, random, and secure string. To keep the Git repository clean of sensitive data, consider creating a `.env` file with these options instead.

Express creates `bin/www`, the server entry point. This file imports the application definition at `app.js` which requires middleware dependencies and sets up routes, mounting the client at root. Additional routes are defined in `routes/` including `api_v1`, where the API is defined.

Note that there is not currently a `systemd` or other service in place to autorestart the server. After reboot it must be started manually.

For backend testing, `curl`, a browser extension, or graphical app such as [Postman](https://www.postman.com/) are recommended. Basic checks against a JSON schema for each response type are defined under `server/testing`. Ensure that these files remain up to date and test frequently with `npm run test`. Reference the JSON schemata in this directory to understand the data generally sent back by the server.

### Running Side-By-Side

It is sometimes helpful to run both the client and the server separately during development, especially when hot-reload on the client is desired. In this situation, the frontend and backend must be run on separate ports. To allow for this, several features must be enabled.

In the client's `nuxt.config.js`, the Axios module `baseURL` must point to the server and `credentials` must be enabled so that cookies are sent cross-site. The port should be different than that of the server.

```javascript
server: {
    // Note that 'server' here refers to Nuxt serving the frontend.
    port: 3001,
    host: 'localhost'
}
```

```javascript
axios: {
    // If the backend server is on port 3000.
    baseURL: 'http://localhost:3000',
    credentials: true
}
```

Similarly, in the server's `config.js`, the port must be different from that of the client. [Cross-origin requests](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) must be enabled, and secure cookies disabled so that the client will know it is safe to share cookies issued by the server between the server and the client.

```javascript
{
    port: 3000,
    host: 'localhost',

    cors_enabled: true,
    cors_origin: 'http://localhost:3001',

    secure_cookies: false,

    ...
}
```

The server and client can then be run separately with:
```bash
$ cd client
$ npm run dev
```
and in a separate terminal...
```bash
$ cd server
$ nodemon
```

Ensure that when it comes to production, `credentials`, `cors_enabled` and `secure_cookies` are `false`, `false`, and `true` respectively so as not to introduce security issues.

### Managing the Database

The database is handled completely by [Mongoose](https://mongoosejs.com/docs/index.html), which provides an interface to MongoDB that includes [models](https://mongoosejs.com/docs/models.html), [schemas](https://mongoosejs.com/docs/guide.html), and [validation](https://mongoosejs.com/docs/validation.html). Refer to the Mongoose documentation when adding functionality to the backend code.

It is not recommended to manually modify the database, however it is occasionally necessary for development purposes. This is dangerous as there is no confirmation before you delete an entire database.

Mongo organizes data into _collections_ of _documents_ (JavaScript objects), assigning each object an `ObjectID`.

The server will create three collections in whatever database has been defined in `config.js`. If the database does not exist, it will be automatically created on first reference.

At the Mongo shell, `use` will switch the context to the desired database. From there, the collections can be listed.

```javascript
$ mongo

> use researcher
> show collections
```

The `scenarios` collection is where all users' data is stored. `users` and `sessions` hold authentication information and `express-session` information respectively.

The contents of any collection may be listed or searched with `find`.

```javascript
// List all documents in a collection.
> db.sessions.find()

// Find documents matching a Query object.
> db.scenarios.find({ _id: ObjectID("5f21d0b62c6778ec05fcc108") })
> db.users.find({ username: TestUser })
```

Mongo uses JavaScript as a scripting language and so common development queries can be easily scripted and run with `mongo script.js`.

### Managing the Filesystem

The server will store and retrieve data from the directories specified in `config.js`. The server requires a directory containing the default copy of the simulation code as well as a directory containing default assets for new users. New directories may be created to host simulations and store uploaded assets and other user data. Temporary files may also be created in the host's `/tmp` filesystem under `"sim-prev/"` to generate and serve simulation previews and zip files.

Ensure that a path exists for the server's data and that the server has write permissions. Any files in this path may be overwritten by the server. See the example structure in `server/data/`.

### Server API (v1)

API endpoints must always respond with a JSON object of the following format.
```javascript
{
    success: Boolean,
    message: String,
    result: Object
}
```

The API defines endpoints for managing scenarios, assets, and user authentication.

| Method | Endpoint | Function |
| --- | --- | --- |
| `GET` | `/api/v1/scenarios` | Get the list of scenarios. |
| `POST` | `/api/v1/scenarios` | Create a new scenario. |
| `GET` | `/api/v1/scenarios/{scenario_id}` | Get a scenario. |
| `PUT` | `/api/v1/scenarios/{scenario_id}` | Save a scenario. |
| `POST` | `/api/v1/scenarios/{scenario_id}` | Copy a scenario. |
| `DELETE` | `/api/v1/scenarios/{scenario_id}` | Delete a scenario. |
| `POST` | `/api/v1/scenarios/{scenario_id}/generate` | Generate a simulation. |
| `POST` | `/api/v1/scenarios/{scenario_id}/zip` | Prepare a ZIP of a generated simulation. |
| `GET` | `/api/v1/assets` | Get the list of assets. |
| `POST` | `/api/v1/assets` | Upload an asset. |
| `POST` | `/api/v1/assets/{asset_id}` | Copy an asset. |
| `DELETE` | `/api/v1/assets/{asset_id}` | Delete an asset. |
| `GET` | `/api/v1/assets/{asset_id}/thumbnail` | Get an asset's image thumbnail. |
| `POST` | `/api/v1/auth/login` | Begin a logged in session. |
| `POST` | `/api/v1/auth/logout` | Destroy a logged in session. |
| `POST` | `/api/v1/auth/register` | Register new credentials. |
| `GET` | `/api/v1/auth/user` | Get the user of the current session. |
| `GET` | `/api/v1/admin/users` | Get the list of user information. |
| `PUT` | `/api/v1/admin/users/{user_id}/permissions` | Set the permissions of a user. |
| `PUT` | `/api/v1/admin/users/{user_id}/password` | Set the permissions of a user. |
| `PUT` | `/api/v1/admin/users/{user_id}/attributes` | Set other properties of a user. |
| `DELETE` | `/api/v1/admin/users/{user_id}` | Delete a user. |