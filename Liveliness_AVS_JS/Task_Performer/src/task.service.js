"use strict";
const { ethers } = require("ethers");
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
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    performHealthcheckTask
};
