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

async function sendTask(definitionId, cid) {
  const jsonRpcBody = {
    jsonrpc: "2.0",
    method: "sendTask",
    params: [
      cid,
      definitionId,
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
    const cid = response.IpfsHash;
    console.log(`cid: ${cid}`);
    return cid;
  }

module.exports = {
  init,
  publishJSONToIpfs,
  sendTask
}
