require('dotenv').config();

const { ethers } = require('ethers');
const { healthcheck } = require('common_liveliness');
const { getOperatorsLength, getOperator } = require('./db.service');

var rpcBaseAddress='';
var l2Rpc='';

// hacky af but it works
// ethers continously logs if it can't connect to the network
/*
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
*/

function init() {
  console.log(healthcheck);
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

  const healthcheckResult = await healthcheck.healthcheckOperator(chosenOperator.endpoint, blockNumber, blockHash);
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

module.exports = {
  init,
  performHealthcheck,
}