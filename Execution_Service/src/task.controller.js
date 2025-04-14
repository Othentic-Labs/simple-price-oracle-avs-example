"use strict";
const { Router } = require("express")
const CustomError = require("./utils/validateError");
const CustomResponse = require("./utils/validateResponse");
const oracleService = require("./oracle.service");
const dalService = require("./dal.service");
const router = Router()
const loadNetworkService = require("./loadnetwork.service");

router.post("/execute", async (req, res) => {
    console.log("Executing task");

    try {
        var taskDefinitionId = Number(req.body.taskDefinitionId) || 0;
        console.log(`taskDefinitionId: ${taskDefinitionId}`);

        const result = await oracleService.getPrice("ETHUSDT");
        result.price = req.body.fakePrice || result.price;
        const transactionHash = await loadNetworkService.publishJSON(result);
        const data = "hello";
        await dalService.sendTask(transactionHash, data, taskDefinitionId);
        return res.status(200).send(new CustomResponse({proofOfTask: transactionHash, data: data, taskDefinitionId: taskDefinitionId}, "Task executed successfully"));
    } catch (error) {
        console.log(error)
        return res.status(500).send(new CustomError("Something went wrong", {}));
    }
})


module.exports = router
