require('dotenv').config();
const validateHealthcheckResponse = require('./utils/validateHealthcheckResponse');
const { getAddressByPeerID } = require('./db.service');
const { ethers } = require('ethers');

const JSON_RPC_PORT = 8545;
const MAX_BLOCKS_PASSED = 10;
const CHECK_INTERVAL = 10000;
const CHECKS = 1;

var rpcBaseAddress='';
var l1Rpc='';

// hacky af but it works
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
  l1Rpc = process.env.L1_RPC;
}

async function healthcheckResults() {
  // First: collect all operator responses
  const l1Provider = new ethers.JsonRpcProvider(l1Rpc);
  let taskData = { operators: [], timestamp: Date.now() };

  try {
    const peers = await getDiscoveredPeers();
    if (peers === null) {
      throw new Error("Error getting operators");
    }
    
    // list of { ip, peerId }
    const operators = peers
      .filter(x => x.split("/")[2].split(".")[0] !== "127") // filter out localhost
      .map(x => {return { ip: x.split("/")[2], peerId: x.split("/")[6] }});
    
    console.log("Operators:", operators);
    
    for (const { ip, peerId } of operators) {
      /*
      include once AVSLogic is implemented

      // skip peers that are not registered on chain
      const operatorAddress = await getAddressByPeerID(peerId);
      if (operatorAddress === null) {
        console.log(`peer ${peerId} is not registered to AVS logic`);
        continue;
      }
      */

      const recentBlocknumber = await l1Provider.getBlockNumber();
      let { response, isValid } = await healthcheckOperator(ip, peerId, recentBlocknumber);
      if (isValid) {
        taskData.operators.push({ operator: { ip, peerId }, response, isValid }); 
      } else {
        taskData.operators.push({ operator: { ip, peerId }, response: {}, isValid });
      }
    }
  } catch (error) {
    console.error("Error health checking operators: ", error);
    return null;
  }

  console.log("Task Data (Step 1): ", taskData);

  // Secondly: wait X minutes, check again all operators that are down
  // TODO: should check them simulteniously (?)
  try {
    for (let i = 0; i < CHECKS; i++) {
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
      console.log(`performing check: ${i}`);

      for (const operatorData of taskData.operators) {
        if (operatorData.isValid) {
          // skip operators that are valid
          console.log("skipping valid operator");
          continue;
        }
        const recentBlocknumber = await l1Provider.getBlockNumber();
        const { response, isValid } = await healthcheckOperator(operatorData.operator.ip, operatorData.operator.peerId, recentBlocknumber);

        if (isValid) {
          taskData.operators.isValid = true;
          taskData.operators.response = response;
        }
      }
    }
  } catch (error) {
    console.error("Error health checking operators: ", error);
    return null;
  }

  return taskData;
}

async function getDiscoveredPeers() {
  let response = null;
  const jsonRpcBody = {
    jsonrpc: "2.0",
    method: "getDiscoveredPeers",
    params: []
  };
  
  try {
    const provider = new ethers.JsonRpcProvider(rpcBaseAddress);
    response = await provider.send(jsonRpcBody.method, jsonRpcBody.params);
    console.log("getDiscoveredPeers API response:", response);
  } catch (error) {
    console.error("Error making API request:", error);
  }
  
  return response;
}

// TODO: refactor so performer and attesters share code of validating responses
// operator is ip address
// recentBlocknumber is the blocknumber the performer checks the blocknumber against

/**
 * format of response:
 * {
 *   address: address of operator
 *   blockNumber: the most recent blockNumber operator has
 *   blockHash: the blockHash go blockNumber
 *   signature: sign(address.privateKey, [blockHash, peerId])
 *   peerId: the peerId in the p2p communication 
 * }
 */
async function healthcheckOperator(ip, peerId, recentBlocknumber) {
  let response = null;
  let isValid = false;
  const jsonRpcBody = {
    jsonrpc: "2.0",
    method: "healthcheck",
    params: []
  };

  try {
    const l1Provider = new ethers.JsonRpcProvider(l1Rpc);
    const operatorProvider = new ethers.JsonRpcProvider(`http://${ip}:${JSON_RPC_PORT}`);
    response = await operatorProvider.send(jsonRpcBody.method, jsonRpcBody.params);
    console.log("healthcheck API response:", response);

    isValid = await validateHealthcheckResponse(response, { peerId, recentBlocknumber, maxBlocksPassed: MAX_BLOCKS_PASSED, chainProvider: l1Provider});
  } catch (error) {
    console.error("Error making API request:", error);
    return { response: null, isValid: false };
  }
  
  return { response, isValid: true };
}

module.exports = {
  init,
  healthcheckResults,
}