"use strict";
const { ethers } = require("ethers");
const dalService = require("./dal.service");
const healthcheckService = require("./healthcheck.service");


const RETRIES = 4;
const RETRY_DELAY = 5000;

async function performHealthcheckTask() {
    try {
        var taskDefinitionId = 0;
        console.log(`taskDefinitionId: ${taskDefinitionId}`);

        let isValid = false;
        let tries = 0;
        let healthcheckTask = null;
        while (!isValid && tries < RETRIES) {
            if (tries > 0) {
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
            }

            console.log(`Performing healthcheck task, attempt ${tries + 1}`);
            healthcheckTask = await healthcheckService.performHealthcheck();
            if (!healthcheckTask) {
                throw new Error("Healthcheck failed");
            }

            isValid = healthcheckTask.isValid;
            tries++;
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
