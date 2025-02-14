require('dotenv').config();
const axios = require("axios");
const { ethers } = require("ethers")
const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth_sepolia")

const aggregatorV3InterfaceABI = [
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "description",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint80", name: "_roundId", type: "uint80" }],
    name: "getRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];
const ETH_USD_24HR_VOLATILITY_ADDRESS = "0x31D04174D0e1643963b38d87f26b0675Bb7dC96e"

function calculateFee(tradeSize, marketVolatility) {
  const baseFee = 3.5;
  const maxFee = 5.5;
  const tradeThreshold = 150; // ETH
  const volatilityThreshold = 0.60; // 60%

  let fee = 2 * (tradeSize / tradeThreshold) * Math.pow((marketVolatility / volatilityThreshold), 2) + baseFee;

  return Math.min(fee, maxFee); 
}

async function getFee(volume) {
  var res = null;
    try {
        const volatilityFeed = new ethers.Contract(ETH_USD_24HR_VOLATILITY_ADDRESS, aggregatorV3InterfaceABI, provider);
        const decimals = await volatilityFeed.decimals();
        const roundData = await volatilityFeed.latestRoundData();
        const volatility = Number(roundData[1]) / 10 ** Number(decimals);
        var fee = calculateFee(volume, volatility);
        console.log("Calculated Fee", fee);
        res = fee
    } catch (err) {
      console.error("Error calculating fee:" + err)
    }
    return res;
  }
  
  module.exports = {
    getFee: getFee,
  }