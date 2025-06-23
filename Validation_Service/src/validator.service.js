require('dotenv').config();
const dalService = require("./dal.service");
const oracleService = require("./oracle.service");

var validationResult = true;
console.log("validator.service.js loaded");

async function validate(proofOfTask) {
  console.log("In the validate function");
  validationResult = process.env.VALIDATOR_RESULT === "true";
  try {
      console.log("Validation Service started which returns ", validationResult);
      return validationResult;
    } catch (err) {
      console.error(err?.message);
      return false;
    }
  }
  
  module.exports = {
    validate,
  }