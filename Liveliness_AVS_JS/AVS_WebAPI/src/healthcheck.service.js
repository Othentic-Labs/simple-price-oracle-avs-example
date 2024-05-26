const { ethers } = require("ethers");

async function healthcheckOperator(endpoint, blockNumber, blockHash) {
  let response = null;
  let isValid = false;
  const jsonRpcBody = {
    jsonrpc: "2.0",
    method: "healthcheck",
    params: [blockNumber]
  };
  
  try {
    const provider = new ethers.JsonRpcProvider(endpoint);
    response = await provider.send(jsonRpcBody.method, jsonRpcBody.params);
    console.log("healthcheck API response:", response);
    
    isValid = await validateHealthcheckResponse(response, { blockHash });
    if (isValid === null) {
      console.error("Error validating healthcheck response");
      return null;
    }
  } catch (error) {
    console.error("Error making API request:", error);
    return { response: null, isValid: false };
  }
  
  return { response, isValid: true };
}

module.exports = {
  healthcheckOperator,
}