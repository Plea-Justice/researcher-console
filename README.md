# Plea Simulation Researcher Console

The researcher console is a web-based interface for configuring the [plea bargain simulation](https://github.com/Plea-Justice/pleabargain-simulation). A project overview and detailed documentation are available at [pleajustice.org](https://plejustice.org).

## Dependencies

* [Node.js](https://nodejs.org/en/)
* [MongoDB](https://www.mongodb.com/)

Additional Node based software will be installled by `npm`. MongoDB is only necessary for running the backend. No additional setup for the database is necessary other than starting the service and modifying the URI in `server/config.js`.

## Client

### Building the Frontend

```bash
# switch to the client's directory.
$ cd client/

# install dependencies
$ npm install

# serve the client for development with hot reload at localhost:3000
$ npm run dev

# build for production and serve just the client
$ npm run build
$ npm run start

# build static project in client/dist/ for production to be served by backend
$ npm run build
$ npm run export
```

The client is built using [Nuxt](https://nuxtjs.org), which provides additional features to [Vue](https://vuejs.org/). Components are from [Buefy](https://buefy.org/), a [Bulma](https://bulma.io/) based CSS framework.

## Server

### Running the Backend

```bash
# switch to the server's directory.
$ cd server/

# install dependencies
$ npm install

# configure server
$ vim config.js

# start the server for development with hot reload using nodemon
$ npm install -g nodemon
$ nodemon

# start the server for production
$ node bin/www
```

The server is built using [Express](https://expressjs.com/en/api.html). Configuration is stored in `server/config.js`. The client must be enabled in this file. Make sure to define separate databases for development and production and select the appropriate database in this file.

The server is defined at `server/bin/www`. It imports the application definition at `app.js` which requires middleware dependencies and sets up routes, mounting the client at root. Additional routes defined in `routes/` including `api_v1`, where the API is defined.

For backend testing, `curl`, a browser extension, or graphical app such as [Postman](https://www.postman.com/) are recommended.

### Server API

The server will always respond with a JSON object of the following format.
```javascript
{
    success: Boolean,
    message: String,
    return: Object
}
```

The API defines endpoints for managing scenarios, assets, and user authentication.

| Method | Endpoint | Function |
| --- | --- | --- |
| `GET` | `/api/v1/s` | Get the list of scenarios. |
| `POST` | `/api/v1/s` | Create a new scenario. |
| `GET` | `/api/v1/s/{scenario_id}` | Get a scenario. |
| `PUT` | `/api/v1/s/{scenario_id}` | Save a scenario. |
| `DELETE` | `/api/v1/s/{scenario_id}` | Delete a scenario. |
| `GET` | `/api/v1/s/{scenario_id}/zip` | Get a scenario. |
| `GET` | `/api/v1/a` | Get the list of assets. |
| `POST` | `/api/v1/a` | Upload an asset. |
| `DELETE` | `/api/v1/a/{asset_id}` | Get the list of assets. |
| `POST` | `/api/v1/auth/login` | Begin a logged in session. |
| `POST` | `/api/v1/auth/logout` | Destroy a logged in session. |
| `POST` | `/api/v1/auth/register` | Register new credentials. |
| `GET` | `/api/v1/auth/user` | Get the user of the current session. |
