const { ethers } = require("ethers");

async function validateHealthcheckResponse(response, { blockHash }) {
  try {
    // 1. Verify that blockhash in response is the blockhash of blocknumber that was sent
    if (response.blockHash !== blockHash) {
      console.error("Block hash does not match response block hash");
      return false;
    }

    // 2. Verify blockhash is indeed signed by address
    const payload = ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint256'],
      [response.blockHash]
    );
    const message = ethers.getBytes(ethers.keccak256(payload));
    const signature = response.signature;
    
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress !== response.address) {
      console.error("Recovered address does not match response address");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating healthcheck response:", error);
    return null;
  }
}

module.exports = validateHealthcheckResponse;