require('dotenv').config();
const dalService = require("./dal.service");
const { healthcheckService } = require("common_liveliness");
const { ethers } = require('ethers');

let l2Rpc;
let attestationCenterAddress;

function init() {
  l2Rpc = process.env.L2_RPC;
  attestationCenterAddress = process.env.ATTESTATION_CENTER_ADDRESS;
}

async function validate(proofOfTask, data) {
  const l2Provider = new ethers.JsonRpcProvider(l2Rpc);
  const taskResult = await dalService.getIPfsTask(proofOfTask);

  if (taskResult === null) {
    console.log("Task not found in IPFS");
    return false;
  }
  
  const { blockHash, chosenOperator, response, isValid } = taskResult;
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

  const chosenOperatorCheck = await dalService.getChosenOperator(blockHash, blockNumber, {
    attestationCenterAddress, 
    provider: l2Provider
  });

  if (chosenOperator.operatorAddress !== chosenOperatorCheck.operatorAddress || chosenOperator.endpoint !== chosenOperatorCheck.endpoint) {
    console.log("Chosen operator is different from chosen operator in task");
    return false;
  }

  // data is chosenOperator.operatorAddress in order to read on-chain
  const dataCheck = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address", "bool"],
    [chosenOperator.operatorAddress, isValid]
  );

  console.log({ data, dataCheck })
  if (data !== dataCheck) {
    console.log("Data field is different from chosen operator address");
    return false;
  }

  if (isValid) {
    console.log("isValid is true, validating response with: ", { response, blockHash });
    const isValidCheck = await healthcheckService.validateHealthcheckResponse(response, { blockHash });
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
    console.log("isValid is false, performing healthcheck on operator: ", { chosenOperator, blockNumber, blockHash});
    const { isValid: isValidCheck } = await healthcheckService.healthcheckOperator(chosenOperator.endpoint, blockNumber, blockHash);
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