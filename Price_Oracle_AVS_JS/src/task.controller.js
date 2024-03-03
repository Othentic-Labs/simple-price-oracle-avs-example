"use strict";
const { Router } = require("express")
const CustomError = require("./utils/validateError");
const CustomResponse = require("./utils/validateResponse");
const oracleService = require("./oracle.service");
const dalService = require("./dal.service");
const validatorService = require("./validator.service");

const router = Router()

router.post("/execute", async (req, res) => {
    console.log("Executing task");

    try {
        const result = await oracleService.getPrice("ETHUSDT");
        const cid = await dalService.publishJSONToIpfs(result);
        return res.status(200).send(new CustomResponse(cid));
    } catch (error) {
        console.log(error)
        return res.status(500).send(new CustomError("Something went wrong", {}));
    }
})

router.post("/validate", async (req, res) => {
    var proofOfTask = req.body.proofOfTask;
    console.log(`Validate task: prood of task: ${proofOfTask}`);
    try {
        const result = await validatorService.validate(proofOfTask);
        return res.status(200).send(new CustomResponse(result));
    } catch (error) {
        console.log(error)
        return res.status(500).send(new CustomError("Something went wrong", {}));
    }
})

module.exports = router
