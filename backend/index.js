require("dotenv").config();

const bootstrap = require("./src/app.js");
const express = require("express");
const app = express();
const port = process.env.PORT;
bootstrap(app, express);
app.listen(port, () => console.info(`server listening on port ${port}`));
