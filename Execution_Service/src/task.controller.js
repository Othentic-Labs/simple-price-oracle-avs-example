"use strict";
const { Router } = require("express")
const CustomError = require("./utils/validateError");
const CustomResponse = require("./utils/validateResponse");
const oracleService = require("./oracle.service");
const dalService = require("./dal.service");

const router = Router()

router.post("/execute", async (req, res) => {
    console.log("Executing task");

    var output = req.body.params;
    var gpuOutput = JSON.parse(output[0]);
    var cert = gpuOutput["Certificate"];
    var epk = gpuOutput["EPK"]; 
    var sig = output[output.length - 1];
    console.log(`req.body.params: ${output}`);
    console.log(`gpuJSON output: ${gpuOutput}`);
    console.log(`extracted certificate: ${cert}`);
    console.log(`extracted ephemeral public key: ${epk}`);
    console.log(`extracted signature: ${sig}`);

    //All the task performer does is package up & send out the data to the attestor

    try {
        var taskDefinitionId = Number(req.body.taskDefinitionId) || 0;
        console.log(`taskDefinitionId: ${taskDefinitionId}`);
        const cid = await dalService.publishJSONToIpfs(gpuOutput);
        const data = sig;
        await dalService.sendTask(cid, data, taskDefinitionId);
        return res.status(200).send(new CustomResponse({jsonrpc: 2.0, proofOfTask: cid, data: data, taskDefinitionId: taskDefinitionId}, "Task executed successfully"));
    } catch (error) {
        console.log(error)
        return res.status(500).send(new CustomError("Something went wrong", {}));
    }
})


module.exports = router
