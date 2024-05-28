const operators = [
    {
        operatorAddress: "0xaD9D986d612B291A64cbdce1B3f50a95B66D68D3",
        endpoint: "http://10.8.0.2:8545",
    },
    {
        operatorAddress: "0x4aBa6BC2efa0C5b5dE5382eb9895847252ed23Ed",
        endpoint: "http://10.8.0.3:8545",
    },
    {
        operatorAddress: "0x1B6dBf8213a1c6B7A18B7a97be1e0F3A171af7D2",
        endpoint: "http://10.8.0.4:8545",
    },
];

// should use LivelinessRegistry to get all operators
async function getOperatorsLength(blockhash) {
    return operators.length;
}

async function getOperator(operatorIndex, blockhash) {
    return operators[operatorIndex];
}

async function getChosenOperator(blockHash) {
    const operatorsLength = await getOperatorsLength(blockHash);
    // NOTE: there is slight modulo bias but assumes number of operators is small enough it doesn't matter
    // NOTE: maybe should use RANDAO instead of blockhash since miner can manipulate blockhash      
    const chosenOperatorIndex = (blockHash % operatorsLength);
    return await getOperator(chosenOperatorIndex, blockHash);
}

module.exports = {
    getOperatorsLength,
    getOperator,
    getChosenOperator,
}