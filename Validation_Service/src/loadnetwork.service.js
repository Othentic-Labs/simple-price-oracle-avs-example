require('dotenv').config();
const axios = require('axios');

let bundlerGatewayHost = '';

function init() {
  bundlerGatewayHost = process.env.BUNDLER_GATEWAY_HOST || 'https://resolver.bot/bundle/';
}

/**
 * Fetches task JSON from the Bundler Network using txHash.
 * @param {string} txHash - The txHash of the uploaded JSON file.
 * @returns {{symbol: string, price: number}} - Parsed symbol and price.
 */
async function getBundlerTask(txHash) {
  try {
    const url = `${bundlerGatewayHost}${txHash}/0`;
    console.log("fetch url", url);
    const { data } = await axios.get(url);
    console.log(data);
    return {
      symbol: data.symbol,
      price: parseFloat(data.price),
    };
  } catch (error) {
    console.error(`❌ Error fetching Bundler task for ${txHash}:`, error.message);
    return null;
  }
}

module.exports = {
  init,
  getBundlerTask,
};
