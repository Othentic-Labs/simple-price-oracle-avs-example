"use strict";
const app = require("./configs/app.config")
const PORT = process.env.port || process.env.PORT || 4003
const dalService = require("./src/dal.service");
const dbService = require("./src/db.service");
const healthcheckService = require("./src/healthcheck.service");
const util = require("common_liveliness").util;

dalService.init();
dbService.init();
healthcheckService.init();
// this line might cause problem in docker builds, can be removed safely if needed
util.suppressEthersJsonRpcProviderError();
app.listen(PORT, () => console.log("Server started on port:", PORT))