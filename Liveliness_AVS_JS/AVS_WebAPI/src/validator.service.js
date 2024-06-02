require('dotenv').config();
const dalService = require("./dal.service");
const { healthcheckService } = require("common_liveliness");
const { ethers } = require('ethers');

const MAX_BLOCKS_PASSED = 5;

let l2Rpc;
let attestationCenterAddress;

function init() {
  l2Rpc = process.env.L2_RPC;
  attestationCenterAddress = process.env.ATTESTATION_CENTER_ADDRESS;
}

/**
 * return true if task was performed correctly, false otherwise
 */
async function validate(proofOfTask, data) {
  const l2Provider = new ethers.JsonRpcProvider(l2Rpc);
  const latestBlocknumber = await l2Provider.getBlockNumber();
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
  // ethers getBlock doesn't work with blockhash so need to use specific RPC method,
  // but number is returned as hexstring, unlinke in getBlock method which returns as number
  const blockNumber = parseInt(block.number, 16);

  if (latestBlocknumber - blockNumber > MAX_BLOCKS_PASSED) {
    console.log("Block is too old");
    return false;
  }

  const chosenOperatorCheck = await dalService.getChosenOperator(blockHash, blockNumber, {
    attestationCenterAddress, 
    provider: l2Provider
  });

  console.debug("chosenOperator comparison: ", { chosenOperator, chosenOperatorCheck });
  if (chosenOperator.operatorAddress !== chosenOperatorCheck.operatorAddress || chosenOperator.endpoint !== chosenOperatorCheck.endpoint) {
    console.log("Chosen operator is different from chosen operator in task");
    return false;
  }

  // data is chosenOperator.operatorAddress in order to read on-chain
  const dataCheck = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address", "bool"],
    [chosenOperator.operatorAddress, isValid]
  );

  console.debug("data comparison: ", { data, dataCheck })
  if (data !== dataCheck) {
    console.log("Data field is different from chosen operator address");
    return false;
  }

  if (isValid) {
    console.debug("isValid is true, validating response with: ", { response, blockHash });
    const isValidCheck = await healthcheckService.validateHealthcheckResponse(response, { blockHash });
    if (!isValidCheck) {
      console.log("Response is invalid");
      return false;
    }
    
    const isChosenOperatorCorrect = chosenOperator.operatorAddress === response.address;
    console.debug("chosen operator check: ", { isChosenOperatorCorrect, chosenOperator, response });
    if (!isChosenOperatorCorrect) {
      console.log("Chosen operator is incorrect");
      return false;
    }
  } else {
    console.debug("isValid is false, performing healthcheck on operator: ", { chosenOperator, blockNumber, blockHash});
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