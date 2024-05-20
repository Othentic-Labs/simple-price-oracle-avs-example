require('dotenv').config();
const { ethers } = require('ethers');

var rpcBaseAddress='';

const OPERATORS_P2P = [
    '12D3KooWCAVja6rpuMNbQt7maA7phdPc1MVfe7A92BnvjBpdwzsW',  // Operator 1
    '12D3KooWP1XoLGuqcGkNqhnZhxyKPHyXTUVYaUHqr8qMkbLmRdCS',  // Operator 2
    '12D3KooWEvFVc4RQ7sH1B3uNSXaL2qTbVTe9tesw4t4yEkEX3sXU',  // Operator 3
]

function init() {
    rpcBaseAddress = process.env.OTHENTIC_CLIENT_RPC_ADDRESS;
}

// currently simply uses getDiscoveredPeers to check if operators are healthy
// potentially should randomly sample from all validators of the network
async function healthcheckResults() {
    let result = { operators: [] };

    try {
        const operators = await getDiscoveredPeers();
        if (operators === null) {
            throw new Error("Error getting operators");
        }

        for (const operator of operators) {
            const isHealthy = await healthcheckOperator(operator);
            result.operators.push({ operator, isHealthy });
        }
    } catch (error) {
        result = null;
        console.error("Error health checking operators:", error);
    }

    return result;
}

async function getDiscoveredPeers() {
    let response = null;
    const jsonRpcBody = {
        jsonrpc: "2.0",
        method: "getDiscoveredPeers",
        params: []
    };
    
    try {
        const provider = new ethers.JsonRpcProvider(rpcBaseAddress);
        response = await provider.send(jsonRpcBody.method, jsonRpcBody.params);
        console.log("getDiscoveredPeers API response:", response);
    } catch (error) {
        console.error("Error making API request:", error);
    }

    return response;
}

// operator is url from discovered peers
async function healthcheckOperator(operator) {
    // in actual AVS, should call by operator's p2p address, but for now use table for ports

    let port = 0;
    if (operator.endsWith(OPERATORS_P2P[0])) {
        port = 8546;
    } else if (operator.endsWith(OPERATORS_P2P[1])) {
        port = 8547;
    } else if (operator.endsWith(OPERATORS_P2P[2])) {    
        port = 8548;
    }

    if (port === 0) {
        throw new Error("Operator not recognized");
    }

    let result = null;
    const jsonRpcBody = {
        jsonrpc: "2.0",
        method: "healthcheck",
        params: []
    };

    try {
        const provider = new ethers.JsonRpcProvider(`http://0.0.0.0:${port}`);
        const response = await provider.send(jsonRpcBody.method, jsonRpcBody.params);
        result = response === "OK";
        console.log("healthcheck API response:", response);
    } catch (error) {
        result = false;
        console.error("Error making API request:", error);
    }

    return result;
}

module.exports = {
    init,
    healthcheckResults,
}