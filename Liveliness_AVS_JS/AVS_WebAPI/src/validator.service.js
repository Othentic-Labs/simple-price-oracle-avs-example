require('dotenv').config();
const dalService = require("./dal.service");
const { healthcheck, db } = require("common_liveliness");
const { ethers } = require('ethers');

let l2Rpc;

function init() {
  l2Rpc = process.env.L2_RPC;
}

// TODO: handle case that operators change between healthcheck and validation
// TODO: handle case format of IPFS file is invalid (punish performer)
async function validate(proofOfTask, data) {
  const l2Provider = new ethers.JsonRpcProvider(l2Rpc);
  const taskResult = await dalService.getIPfsTask(proofOfTask);
  
  const { blockHash, response, isValid } = taskResult;
  const getBlockByHashRequest = {
    jsonrpc: "2.0",
    method: "eth_getBlockByHash",
    params: [blockHash, false]
  };
  const block = await l2Provider.send(getBlockByHashRequest.method, getBlockByHashRequest.params);
  // console.log("Block from eth_getBlockByHash: ", block);
  // ethers getBlock doesn't work with blockhash so need to use specific RPC method,
  // but number is returned as hexstring, unlinke in getBlock method which returns as number
  const blockNumber = parseInt(block.number, 16);
  
  const chosenOperatorCheck = await db.getChosenOperator(blockHash);
  console.log({ chosenOperator, chosenOperatorCheck });
  if (chosenOperator.operatorAddress !== chosenOperatorCheck.operatorAddress || chosenOperator.endpoint !== chosenOperatorCheck.endpoint) {
    console.log("Chosen operator is different from chosen operator in task");
    return false;
  }

  // data is chosenOperator.operatorAddress in order to read on-chain` 
  const dataCheck = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address"],
    [chosenOperator.operatorAddress]
  );

  console.log({ data, dataCheck })
  if (data !== dataCheck) {
    console.log("Data field is different from chosen operator address");
    return false;
  }

  if (isValid) {
    console.log("isValid is true, validating response with: ", { response, blockHash });
    const isValidCheck = await healthcheck.validateHealthcheckResponse(response, { blockHash });
    if (!isValidCheck) {
      console.log("Response is invalid");
      return false;
    }
    
    const isChosenOperatorCorrect = chosenOperator.operatorAddress === response.address;
    console.log("chosen operator check: ", { isChosenOperatorCorrect, chosenOperator, response });
    if (!isChosenOperatorCorrect) {
      console.log("Chosen operator is incorrect");
      return false;
    }
  } else {
    console.log("isValid is false, performing healthcheck on operator: ", { chosenOperator, chosenOperatorIndex, blockNumber, blockHash});
    const { isValid: isValidCheck } = await healthcheck.healthcheckOperator(chosenOperator.endpoint, blockNumber, blockHash);
    if (isValidCheck === null) {
      throw new Error("Error performing healthcheck on operator: ", chosenOperator);
    }
    
    if (isValidCheck) {
      console.log("Healthcheck is valid");
      return false;
    }
  }

  return true;
}

module.exports = {
  init,
  validate,
}