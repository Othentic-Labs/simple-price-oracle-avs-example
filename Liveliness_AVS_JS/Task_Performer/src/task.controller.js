"use strict";
const { Router } = require("express")
const CustomError = require("./utils/validateError");
const CustomResponse = require("./utils/validateResponse");
const dalService = require("./dal.service");
const healthcheckService = require("./healthcheck.service");

const router = Router()

router.post("/execute", async (req, res) => {
    console.log("Executing task");

    try {
        var taskDefinitionId = Number(req.body.taskDefinitionId) || 0;
        console.log(`taskDefinitionId: ${taskDefinitionId}`);

        const healthcheckResults = await healthcheckService.healthcheckResults();
        if (!healthcheckResults) {
            throw new Error("Healthcheck failed");
        }

        console.log("Healthcheck results: ", healthcheckResults);
        const cid = await dalService.publishJSONToIpfs(healthcheckResults);
        const data = "hello";
        await dalService.sendTask(cid, data, taskDefinitionId);
        return res.status(200).send(new CustomResponse({proofOfTask: cid, data: data, taskDefinitionId: taskDefinitionId}, "Task executed successfully"));
    } catch (error) {
        console.log(error)
        return res.status(500).send(new CustomError("Something went wrong", {}));
    }
})


module.exports = router
