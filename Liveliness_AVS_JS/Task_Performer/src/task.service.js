"use strict";
const { ethers } = require("ethers");
const CustomError = require("./utils/validateError");
const CustomResponse = require("./utils/validateResponse");
const dalService = require("./dal.service");
const healthcheckService = require("./healthcheck.service");

async function performHealthcheckTask() {
    try {
        var taskDefinitionId = 0;
        console.log(`taskDefinitionId: ${taskDefinitionId}`);

        const healthcheckTask = await healthcheckService.performHealthcheck();
        if (!healthcheckTask) {
            throw new Error("Healthcheck failed");
        }

        console.log("Healthcheck task: ", healthcheckTask);
        const cid = await dalService.publishJSONToIpfs(healthcheckTask);
        const data = ethers.AbiCoder.defaultAbiCoder().encode( 
            ["address", "bool"],
            [healthcheckTask.chosenOperator.operatorAddress, healthcheckTask.isValid]
        );

        await dalService.sendTask(cid, data, taskDefinitionId);
        // return res.status(200).send(new CustomResponse({proofOfTask: cid, data: data, taskDefinitionId: taskDefinitionId}, "Task executed successfully"));
    } catch (error) {
        console.log(error)
        // return res.status(500).send(new CustomError("Something went wrong", {}));
    }
}

module.exports = {
    performHealthcheckTask
};
