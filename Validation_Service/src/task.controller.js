"use strict";
const { Router } = require("express")
const CustomError = require("./utils/validateError");
const CustomResponse = require("./utils/validateResponse");
const validatorService = require("./validator.service");

const router = Router()

router.post("/validate", async (req, res) => {
    console.log(`Request: ${req.body}`);
    console.log(`request stringified: ${JSON.stringify(req.body)}`)
    var sig = req.body.data;

    var proofOfTask = req.body.proofOfTask;
    console.log(`Validate task: proof of task: ${proofOfTask} with signature: ${sig}`);
    try {
        const result = await validatorService.validate(proofOfTask, sig);
        console.log('Vote:', result ? 'Approve' : 'Not Approved');
        return res.status(200).send(new CustomResponse(result));
    } catch (error) {
        console.log(error)
        return res.status(500).send(new CustomError("Something went wrong", {}));
    }
})

module.exports = router
