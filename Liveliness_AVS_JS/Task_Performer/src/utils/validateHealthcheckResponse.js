const { ethers } = require("ethers");

async function validateHealthcheckResponse(response, { peerId, recentBlocknumber, maxBlocksPassed, chainProvider }) {
  try {
    // 1. Verify that peerId in response matches peerId from discovered
    if (response.peerId !== peerId) {
      console.error("PeerID in response does not match");
      return false;
    }
    
    // 2. Verify blockhash and peerId is indeed signed by address
    const payload = ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint256', 'string'],
      [response.blockHash, response.peerId]
    );
    const message = ethers.getBytes(ethers.keccak256(payload));
    const signature = response.signature;
    
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress !== response.address) {
      console.error("Recovered address does not match response address");
      return false;
    }
    
    // 3. Verify that blocknumber really has said blockhash
    const block = await chainProvider.getBlock(response.blockNumber);
    if (block.hash !== response.blockHash) {
      console.error("Block hash does not match response block hash");
      return false;
    }
    
    // 4. Verify that block is "recent" (no more than X blocks before)
    if (recentBlocknumber - maxBlocksPassed > response.blockNumber) {
      console.error("Signed block is too old");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating healthcheck response:", error);
    return null;
  }
}

module.exports = validateHealthcheckResponse;