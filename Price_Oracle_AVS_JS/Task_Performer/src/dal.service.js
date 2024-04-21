require('dotenv').config();
const pinataSDK = require("@pinata/sdk");
const { ethers, AbiCoder } = require('ethers');

var pinataApiKey='';
var pinataSecretApiKey='';
var ipfsHost='';
var rpcBaseAddress='';
var privateKey='';



function init() {
  pinataApiKey = process.env.PINATA_API_KEY;
  pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
  ipfsHost = process.env.IPFS_HOST;
  rpcBaseAddress = process.env.OTHENTIC_CLIENT_RPC_ADDRESS;
  privateKey = process.env.PRIVATE_KEY;
}

async function sendTask(proofOfTask, taskDefinitionId) {

  var wallet = new ethers.Wallet(privateKey);
  var performerAddress = wallet.address;
  var taskInfo =  {proofOfTask, performerAddress, taskDefinitionId};

  const message = ethers.AbiCoder.defaultAbiCoder().encode(["TaskInfo(string, address, uint16)"], [taskInfo]);

  //const message = ethers.AbiCoder.defaultAbiCoder().encode(["string", "address"], [cid, wallet.address]);
  const messageHash = ethers.keccak256(message);
  const sig = wallet.signingKey.sign(messageHash).serialized;
  const jsonRpcBody = {
    jsonrpc: "2.0",
    method: "sendTask",
    params: [
      proofOfTask,
      taskDefinitionId,
      performerAddress,
      sig,
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

async function publishJSONToIpfs(data) {
    const pinata = new pinataSDK(pinataApiKey, pinataSecretApiKey);
    const response = await pinata.pinJSONToIPFS(data);
    const proofOfTask = response.IpfsHash;
    console.log(`proofOfTask: ${proofOfTask}`);
    return proofOfTask;
  }

module.exports = {
  init,
  publishJSONToIpfs,
  sendTask
}
