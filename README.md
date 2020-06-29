# Plea Simulation Researcher Console

The researcher console is a web-based interface for configuring the plea bargain simulation. For an overview of the project, please see [Plea-Justice/pleabargain-simulation](https://github.com/Plea-Justice/pleabargain-simulation).

## Dependencies

* [Node.js](https://nodejs.org/en/)
* [MongoDB](https://www.mongodb.com/)

Additional Node based software will be installled by `npm`. MongoDB is only necessary for running the backend.

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

# build static project for production to be served by backend
$ npm run generate
```

The client is built using [Nuxt](https://nuxtjs.org), a framework for [Vue](https://vuejs.org/) with components from [Buefy](https://buefy.org/).

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

The server is built using [Express](https://expressjs.com/en/api.html). Configuration is stored in `config.js`. The client must be enabled in this file. Make sure to define separate databases for development and production and select the appropriate database in this file.

The server is defined at `bin/www`. It imports the application definition at `app.js` which requires middleware dependencies, the additional routes defined in `routes/` including `api_v1`, the static files in `public`, and the generated static version of the client at `client/dist`.

An interface for testing the backend exists at `public/test.html`, however using `curl`, a browser extension, or graphical app such as [Postman](https://www.postman.com/) is recommended. If running locally, navigate to [localhost:3000/test.html](http://0.0.0.0:3000/test.html) in a web browser. 

### Server API

| Method | Endpoint | Function | Response |
| --- | --- | --- | --- |
| GET | /api/v1/s | Get the list of scenarios. | { [scenario uuids] } |
| POST | /api/v1/s | Create a new scenario. | { scenario } |
