require('dotenv').config();
const { ethers } = require('ethers');

const JSON_RPC_PORT = 8545;

var rpcBaseAddress='';

function init() {
    rpcBaseAddress = process.env.OTHENTIC_CLIENT_RPC_ADDRESS;
}

// currently simply uses getDiscoveredPeers to check if operators are healthy
// potentially should randomly sample from all validators of the network
async function healthcheckResults() {
    let result = { operators: [], timestamp: Date.now() };

    try {
        const operators = await getDiscoveredPeers();
        if (operators === null) {
            throw new Error("Error getting operators");
        }

        const operatorsIps = operators
            .filter(x => x.split("/")[2].split(".")[0] !== "127") // filter out localhost
            .map(x => x.split("/")[2]);  // get ip address

        for (const operator of operatorsIps) {
            const isHealthy = await healthcheckOperator(operator);
            const operatorAddress = await getOperatorAddress(operator);
            if (isHealthy === null) {
                throw new Error(`Error health checking operator: ${operator}`);
            } else if (operatorAddress === null) {
                throw new Error(`Error getting operator address: ${operator}`);
            }
            result.operators.push({ operator: operatorAddress, isHealthy });
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

async function getOperatorAddress(operator) {
    let address = null;
    const jsonRpcBody = {
        jsonrpc: "2.0",
        method: "getOperatorInfo",
        params: []
    };

    try {
        const provider = new ethers.JsonRpcProvider(`http://${operator}:${JSON_RPC_PORT}`);
        const response = await provider.send(jsonRpcBody.method, jsonRpcBody.params);
        address = response.address;
        console.log("getOperatorAddress API response:", address);
    } catch (error) {
        console.error("Error making API request:", error);
    }

    return address;
}

// operator is url from discovered peers
async function healthcheckOperator(operator) {
    let result = null;
    const jsonRpcBody = {
        jsonrpc: "2.0",
        method: "healthcheck",
        params: []
    };

    try {
        const provider = new ethers.JsonRpcProvider(`http://${operator}:${JSON_RPC_PORT}`);
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