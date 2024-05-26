"use strict";
const app = require("./configs/app.config")
const PORT = process.env.port || process.env.PORT || 4002
const dalService = require("./src/dal.service");
const dbService = require("./src/db.service");
const validatorService = require("./src/validator.service");

dalService.init();
dbService.init();
validatorService.init();
app.listen(PORT, () => console.log("Server started on port:", PORT))