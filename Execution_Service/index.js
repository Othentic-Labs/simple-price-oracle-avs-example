"use strict";
const app = require("./configs/app.config")
const PORT = process.env.port || process.env.PORT || 4003
const dalService = require("./src/dal.service");
const { init } = require("./src/utils/mcl");

(async () => {
    dalService.init();
    await init();
    app.listen(PORT, () => console.log("Server started on port:", PORT))
})();