require('dotenv').config();
const axios = require("axios");



async function getPrice(pair) {
  var res = null;
    try {
        const result = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
        res = result.data;

    } catch (err) {
      console.error("binance api:" + err)
    }
    return res;
  }
  
  module.exports = {
    getPrice,
  }