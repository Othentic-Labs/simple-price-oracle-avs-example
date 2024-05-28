require('dotenv').config();

const { ethers } = require('ethers');
const { healthcheck, db } = require('common_liveliness');

var rpcBaseAddress='';
var l2Rpc='';

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
  
  const chosenOperator = await db.getChosenOperator(blockHash);

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