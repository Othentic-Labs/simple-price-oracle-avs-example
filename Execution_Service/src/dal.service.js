require('dotenv').config();
const pinataSDK = require("@pinata/sdk");
const { ethers } = require('ethers');
import * as grpc from 'grpc';
import { DisperserClient } from './eigenDA/bindings/disperser/disperser_grpc_pb';
import { DisperseBlobRequest } from './eigenDA/bindings/disperser/disperser_pb';

const EIGEN_ENDPOINT = 'disperser-holesky.eigenda.xyz:443';

var pinataApiKey='';
var pinataSecretApiKey='';
var rpcBaseAddress='';
var privateKey='';
let client;

function init() {
  pinataApiKey = process.env.PINATA_API_KEY;
  pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
  rpcBaseAddress = process.env.OTHENTIC_CLIENT_RPC_ADDRESS;
  privateKey = process.env.PRIVATE_KEY;
  client = new DisperserClient(EIGEN_ENDPOINT, grpc.credentials.createSsl());
}

async function sendTask(proofOfTask, data, taskDefinitionId) {
  
  var wallet = new ethers.Wallet(privateKey);
  var performerAddress = wallet.address;
  
  data = ethers.hexlify(ethers.toUtf8Bytes(data));
  const message = ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes", "address", "uint16"], [proofOfTask, data, performerAddress, taskDefinitionId]);
  const messageHash = ethers.keccak256(message);
  const sig = wallet.signingKey.sign(messageHash).serialized;
  
  const jsonRpcBody = {
    jsonrpc: "2.0",
    method: "sendTask",
    params: [
      proofOfTask,
      data,
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
  var proofOfTask = '';
  try {   
    const pinata = new pinataSDK(pinataApiKey, pinataSecretApiKey);
    const response = await pinata.pinJSONToIPFS(data);
    proofOfTask = response.IpfsHash;
    console.log(`proofOfTask: ${proofOfTask}`);
  }
  catch (error) {  
    console.error("Error making API request to pinataSDK:", error);
  }
  return proofOfTask;
}

async function publishToEigenDA(data) {
  var proofOfTask = '';
  try {
    const encoded = encode(data);
    const request = new DisperseBlobRequest();
    request.setData(encoded);
    const response = await disperseBlob(client, request);
    proofOfTask = response.getRequestId();
  } catch (error) {
    console.error("Error making API request to EigenDA:", error);
  }
  return proofOfTask;
}

function disperseBlob(client, request){
  return new Promise((resolve, reject) => {
    client.disperseBlob(request, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
}

module.exports = {
  init,
  publishJSONToIpfs,
  publishToEigenDA,
  sendTask,
}
