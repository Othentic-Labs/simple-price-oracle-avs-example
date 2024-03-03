require('dotenv').config();
const pinataSDK = require("@pinata/sdk");
const axios = require("axios");

var pinataApiKey='';
var pinataSecretApiKey='';
var ipfsHost='';

function init() {
  pinataApiKey = process.env.PINATA_API_KEY;
  pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
  ipfsHost = process.env.IPFS_HOST;
}

async function publishJSONToIpfs(data) {
    const pinata = new pinataSDK(pinataApiKey, pinataSecretApiKey);
    const response = await pinata.pinJSONToIPFS(data);
    const cid = response.IpfsHash;
    console.log(`cid: ${cid}`);
    return cid;
  }

async function getIPfsTask(cid) {
    const { data } = await axios.get(ipfsHost + cid);
    return data;
  }  
  
module.exports = {
  init,
  publishJSONToIpfs,
  getIPfsTask
}