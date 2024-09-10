"use strict";
const { Router } = require("express")
const CustomError = require("./utils/validateError");
const CustomResponse = require("./utils/validateResponse");
const oracleService = require("./oracle.service");
const dalService = require("./dal.service");

const router = Router()

router.post("/execute", async (req, res) => {
    console.log("Executing task");

    try {
        var taskDefinitionId = Number(req.body.taskDefinitionId) || 0;
        console.log(`taskDefinitionId: ${taskDefinitionId}`);

        const result = await oracleService.getPrice("ETHUSDT");
        result.price = req.body.fakePrice || result.price;
        const [cid, poll] = await dalService.publishToEigenDA(result);
        const data = "hello";
        res.status(200).send(new CustomResponse({proofOfTask: cid, data: data, taskDefinitionId: taskDefinitionId}, "Blob dispersion started. Task will be submitted after blob is dispersed."));
        const blob = await poll;
        console.log(`blob data: ${blob}`);
        await dalService.sendTask(cid, data, taskDefinitionId);
    } catch (error) {
        console.log(error);
        if (!res.headersSent) {
            return res.status(500).send(new CustomError("Something went wrong", {}));
        }
    }
})


module.exports = router
