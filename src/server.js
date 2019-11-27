const express = require("express");
const morgan = require("morgan");
const packageData = require("../package.json");
const { configureGraphqlApiRouter, configureRestApiRouter } = require("./api");

function runServer(host, port) {
  const app = express();
  configureServer(app);
  app.listen(port, host, error => {
    if (error) {
      throw error;
    }
    console.log(
      `Listening on http://${host}:${port} (v${packageData.version})...`
    );
    console.log(
      `    ( try: http://${host}:${port}/api/rest/v1/pairs?format=html&members=Peter,Paul,Mary )`
    );
    console.log(`    (  or: http://${host}:${port}/api/gql/v1/ )`);
  });
}

function configureServer(app) {
  app.use(morgan("common"));
  addRestApi(app);
  addGraphqlApi(app);
}

function addRestApi(app) {
  const router = express.Router();
  configureRestApiRouter(router);
  app.use("/api/rest/v1/", router);
}

function addGraphqlApi(app) {
  const router = express.Router();
  configureGraphqlApiRouter(router);
  app.use("/api/gql/v1/", router);
}

module.exports = { runServer };
