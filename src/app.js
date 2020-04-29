const routes = require("./controller/routes.js");
const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
app.use("/", routes);
const server = app.listen(PORT, function () {
  console.log("Server is running at Port " + PORT);
});

module.exports = server;
