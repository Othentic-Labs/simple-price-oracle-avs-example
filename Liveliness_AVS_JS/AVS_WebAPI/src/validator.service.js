require('dotenv').config();
const dalService = require("./dal.service");
const { getOperatorsLength, getOperator} = require("./db.service");
const { healthcheckOperator } = require("./healthcheck.service");
const validateHealthcheckResponse = require("./utils/validateHealthcheckResponse");
const { ethers } = require('ethers');

let l2Rpc;

function init() {
  l2Rpc = process.env.L2_RPC;
}

// TODO: handle case that operators change between healthcheck and validation
// TODO: handle case format of IPFS file is invalid (punish performer)
async function validate(proofOfTask) {
  const l2Provider = new ethers.JsonRpcProvider(l2Rpc);
  const taskResult = await dalService.getIPfsTask(proofOfTask);
  
  const { blockHash, response, isValid } = taskResult;
  const block = l2Provider.getBlock(blockHash);
  const blockNumber = block.number;
  
  const operatorsLength = await getOperatorsLength(blockHash);
  const chosenOperatorIndex = (blockHash % operatorsLength);
  const chosenOperator = await getOperator(chosenOperatorIndex, blockHash);
  
  if (isValid) {
    const isValidCheck = validateHealthcheckResponse(response, { blockHash });
    if (!isValidCheck) {
      return false;
    }
    
    const isChosenOperatorCorrect = chosenOperator.operatorAddress === response.address;
    if (!isChosenOperatorCorrect) {
      return false;
    }
  } else {
    const { isValid: isValidCheck } = healthcheckOperator(chosenOperator.endpoint, blockNumber, blockHash);
    if (isValidCheck === null) {
      throw new Error("Error performing healthcheck on operator: ", chosenOperator);
    }
    
    if (isValidCheck) {
      return false;
    }
  }
  
  return true;
}

module.exports = {
  init,
  validate,
}