require('dotenv').config();
const axios = require("axios");


async function getPrice(pair) {
    try {
        const result = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
        return result.data;

    } catch (err) {
      console.error(err)
    }
  }
  
  module.exports = {
    getPrice,
  }