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
        const result = await oracleService.getPrice("ETHUSDT");
        const { definitionId, fakePrice } = req.body;
        result.price = fakePrice || result.price;
        const cid = await dalService.publishJSONToIpfs(result);
        await dalService.sendTask(definitionId, cid);
        return res.status(200).send(new CustomResponse(cid));
    } catch (error) {
        console.log(error)
        return res.status(500).send(new CustomError("Something went wrong", {}));
    }
})


module.exports = router
