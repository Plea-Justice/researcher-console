# Plea Simulation Researcher Console

The researcher console is a web-based interface for configuring the plea bargain simulation. For an overview of the project, please see [Plea-Justice/pleabargain-simulation](https://github.com/Plea-Justice/pleabargain-simulation).

## Client

### Building the Client

```bash
$ cd client/

# install dependencies
$ npm install

# serve just the client with hot reload at localhost:3000
$ npm run dev

# build for production and serve just the client
$ npm run build
$ npm run start

# generate static project to be served by backend
$ npm run generate
```

The client is built using [Nuxt](https://nuxtjs.org), a framework for [Vue](https://vuejs.org/) with components from [Buefy](https://buefy.org/).


## Server

### Running the Server

```bash
$ cd server/

# install dependencies
$ npm install

# start the server for development with hot reload using nodemon
$ npm install -g nodemon
$ nodemon

# start the server
$ node bin/www
```

The server is built using [Express](https://expressjs.com/en/api.html). Configuration is stored in `server/config.js`.

The server is defined at `bin/www`. It imports the application definition at `app.js` which requires middleware dependencies, the additional routes defined in `routes/` including `routes/api_v1`, the static files in `public`, and the generated static version of the client at `../client/dist`.

An interface for testing the backend exists at `public/test.html`. If running locally, navigate to http://0.0.0.0:3000/test.html in a web browser.

### Server API

| Method | Endpoint | Function | Response |
| --- | --- | --- | --- |
| GET | /api/v1/scenario | Get the list of scenarios. | { [scenario uuids] } |
| POST | /api/v1/scenario | Create a new scenario. | { uuid } |
