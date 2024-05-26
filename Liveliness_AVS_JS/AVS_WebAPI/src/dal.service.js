require('dotenv').config();
const axios = require("axios");

let ipfsHost='';
let l2Rpc='';

function init() {
  ipfsHost = process.env.IPFS_HOST;
  l2Rpc = process.env.L2_RPC;
}

async function getIPfsTask(cid) {
    const { data } = await axios.get(ipfsHost + cid);
    return {
      blockHash: data.blockHash,
      response: data.response,
      isValid: data.isValid,
    };
  }  
  
module.exports = {
  init,
  getIPfsTask
}