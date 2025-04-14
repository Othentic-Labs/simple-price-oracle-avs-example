require('dotenv').config();
const { ethers } = require('ethers');
const { getSigningKey, sign } = require('./utils/mcl');

var rpcBaseAddress='';
var performerAddress='';
var privateKey='';


function init() {
  rpcBaseAddress = process.env.OTHENTIC_CLIENT_RPC_ADDRESS;
  performerAddress = process.env.PERFORMER_ADDRESS;
  privateKey = process.env.PRIVATE_KEY_PERFORMER;
}

async function sendTask(proofOfTask, data, taskDefinitionId) {

  data = ethers.hexlify(ethers.toUtf8Bytes(data));
  const message = ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes", "address", "uint16"], [proofOfTask, data, performerAddress, taskDefinitionId]);
  const messageHash = ethers.keccak256(message);
  const signingKey = getSigningKey(privateKey);
  const sig = sign(signingKey, messageHash);
  const sigType = 'bls';

  const jsonRpcBody = {
    jsonrpc: "2.0",
    method: "sendTask",
    params: [
      proofOfTask,
      data,
      taskDefinitionId,
      performerAddress,
      sig,
      sigType
    ]
  };
    try {
      const provider = new ethers.JsonRpcProvider(rpcBaseAddress);
      const response = await provider.send(jsonRpcBody.method, jsonRpcBody.params);
      console.log("API response:", response);
  } catch (error) {
      console.error("Error making API request:", error);
  }
}


module.exports = {
  init,
  sendTask
}
