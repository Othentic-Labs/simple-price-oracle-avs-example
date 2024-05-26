require('dotenv').config();
const validateHealthcheckResponse = require('./utils/validateHealthcheckResponse');
const { getOperatorsLength, getOperator } = require('./db.service');
const { ethers } = require('ethers');

var rpcBaseAddress='';
var l2Rpc='';

// hacky af but it works
// ethers continously logs if it can't connect to the network
const previousConsoleLog = console.log;
console.log = (message, ...optionalParameters) => { 
  if (message.startsWith("JsonRpcProvider failed to detect network and cannot start up;")) {
    return;
  }

  previousConsoleLog(message, ...optionalParameters);
}

const previousConsoleError = console.error;
console.error = (message, ...optionalParameters) => {
  if (message.startsWith("JsonRpcProvider failed to detect network and cannot start up;")) {
    return;
  }

  previousConsoleError(message, ...optionalParameters);
}

function init() {
  rpcBaseAddress = process.env.OTHENTIC_CLIENT_RPC_ADDRESS;
  l2Rpc = process.env.L2_RPC;
}

async function performHealthcheck() {
  const l2Provider = new ethers.JsonRpcProvider(l2Rpc);
  const recentBlock = await l2Provider.getBlock("latest");
  const blockNumber = recentBlock.number;
  const blockHash = recentBlock.hash;
  
  const operatorsLength = await getOperatorsLength(blockHash);
  // NOTE: there is slight modulo bias but assumes number of operators is small enough it doesn't matter
  // NOTE: maybe should use RANDAO instead of blockhash since miner can manipulate blockhash
  const chosenOperatorIndex = (blockHash % operatorsLength);
  const chosenOperator = await getOperator(chosenOperatorIndex, blockHash);

  const healthcheckResult = await healthcheckOperator(chosenOperator.endpoint, blockNumber, blockHash);
  if (healthcheckResult === null) {
    throw new Error("Error performing healthcheck");
  }

  // TODO: add retries
  let { response, isValid } = healthcheckResult;

  const task = {
    blockHash,
    response,
    isValid,
  }

  return task;
}

async function healthcheckOperator(endpoint, blockNumber, blockHash) {
  let response = null;
  let isValid = false;
  const jsonRpcBody = {
    jsonrpc: "2.0",
    method: "healthcheck",
    params: [blockNumber]
  };

  try {
    const provider = new ethers.JsonRpcProvider(endpoint);
    response = await provider.send(jsonRpcBody.method, jsonRpcBody.params);
    console.log("healthcheck API response:", response);

    isValid = await validateHealthcheckResponse(response, { blockHash });
    if (isValid === null) {
      console.error("Error validating healthcheck response");
      return null;
    }
  } catch (error) {
    console.error("Error making API request:", error);
    return { response: null, isValid: false };
  }
  
  return { response, isValid: true };
}

module.exports = {
  init,
  performHealthcheck,
}