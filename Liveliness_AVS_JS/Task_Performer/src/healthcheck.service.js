require('dotenv').config();

const { ethers } = require('ethers');
const dalService = require('./dal.service');
const { healthcheckService } = require('common_liveliness');

var rpcBaseAddress='';
var l2Rpc='';
var attestationCenterAddress='';

function init() {
  rpcBaseAddress = process.env.OTHENTIC_CLIENT_RPC_ADDRESS;
  l2Rpc = process.env.L2_RPC;
  attestationCenterAddress = process.env.ATTESTATION_CENTER_ADDRESS;
}

async function performHealthcheck() {
  const l2Provider = new ethers.JsonRpcProvider(l2Rpc);
  const recentBlock = await l2Provider.getBlock("latest");
  const blockNumber = recentBlock.number;
  const blockHash = recentBlock.hash;
  
  const chosenOperator = await dalService.getChosenOperator(
    blockHash, 
    {
      attestationCenterAddress, 
      provider: l2Provider
    }
  );

  const healthcheckResult = await healthcheckService.healthcheckOperator(chosenOperator.endpoint, blockNumber, blockHash);
  if (healthcheckResult === null) {
    throw new Error("Error performing healthcheck");
  }

  let { response, isValid } = healthcheckResult;

  const task = {
    blockHash,
    chosenOperator,
    response,
    isValid,
  }

  return task;
}

module.exports = {
  init,
  performHealthcheck,
}