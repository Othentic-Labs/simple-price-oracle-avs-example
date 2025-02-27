require('dotenv').config();
const axios = require("axios");

var ipfsHost='';

function init() {
  ipfsHost = process.env.IPFS_HOST;
  console.log(`ipfs host: ${ipfsHost}`);
}


async function getIPfsTask(cid) {
    const response = await axios.get(ipfsHost + cid);
    console.log("gpuData retrieved from ipfs")
    return {
      gpuData: response.data
    };
  }  
  
module.exports = {
  init,
  getIPfsTask
}