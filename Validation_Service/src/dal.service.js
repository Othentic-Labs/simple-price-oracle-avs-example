require('dotenv').config();
const axios = require("axios");

var ipfsHost='';

function init() {
  ipfsHost = process.env.PINATA_GATEWAY;
}


async function getIPfsTask(cid) {
    const { data } = await axios.get(ipfsHost + cid);
    return {
      symbol: data.symbol,
      price: parseFloat(data.price),
    };
  }  
  
module.exports = {
  init,
  getIPfsTask
}