const { ethers } = require("ethers");

const ATTESTATION_CENTER_ABI = [
    'function operators(uint) public view returns (address, uint, uint, uint8)',
    'function numOfOperators() public view returns (uint)',
    'function avsLogic() public view returns (address)',
];

const LIVELINESS_REGISTRY_ABI = [
    'function registrations(address) external view returns (uint256, uint256, string)',
];

// should use LivelinessRegistry to get all operators
// TODO: decide if to incorporate blockhash or is it too much for an example
async function getOperatorsLength(blockhash, { attestationCenterAddress, provider }) {
    const attestationCenterContract = new ethers.Contract(attestationCenterAddress, ATTESTATION_CENTER_ABI, provider);
    return await attestationCenterContract.numOfOperators();
}

async function getOperator(operatorIndex, blockhash, { attestationCenterAddress, provider } ) {
    const attestationCenterContract = new ethers.Contract(attestationCenterAddress, ATTESTATION_CENTER_ABI, provider);
    const [operatorAddress,] = await attestationCenterContract.operators(operatorIndex);
    const avsLogicAddress = await attestationCenterContract.avsLogic();
    const avsLogic = new ethers.Contract(avsLogicAddress, LIVELINESS_REGISTRY_ABI, provider);
    const [,,endpoint] = await avsLogic.registrations(operatorAddress);

    return { operatorAddress, endpoint };
}

async function getChosenOperator(blockHash, { attestationCenterAddress, provider }) {
    const operatorsLength = await getOperatorsLength(blockHash, { attestationCenterAddress, provider });
    // NOTE: there is slight modulo bias but assumes number of operators is small enough it doesn't matter
    // NOTE: maybe should use RANDAO instead of blockhash since miner can manipulate blockhash
    console.log({blockHash, operatorsLength});
    const chosenOperatorIndex = (BigInt(blockHash) % BigInt(operatorsLength)) + 1n;
    return await getOperator(chosenOperatorIndex, blockHash, { attestationCenterAddress, provider });
}

module.exports = {
    getOperatorsLength,
    getOperator,
    getChosenOperator,
}