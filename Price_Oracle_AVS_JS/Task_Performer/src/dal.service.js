require('dotenv').config();
const pinataSDK = require("@pinata/sdk");
const { ethers } = require('ethers');

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

async function sendTask(cid) {

  var wallet = new ethers.Wallet(privateKey);
  const proofHash = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['string'], [cid]));
  const proofBytes = ethers.utils.arrayify(proofHash);
  var sig = await wallet.signMessage(proofBytes);

  const jsonRpcBody = {
    jsonrpc: "2.0",
    method: "sendTask",
    params: [
      cid,
      1,
      sig
    ]
  };
    try {
      const provider = new ethers.providers.JsonRpcProvider(rpcBaseAddress);
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