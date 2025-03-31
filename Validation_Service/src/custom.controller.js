"use strict";
const { Router } = require("express")
const { ethers } = require('ethers');
const { keccak256, toUtf8Bytes } = require("ethers");
const axios = require("axios");

const commitments = new Map(); // { nodeId: { commitment, salt, bid } }
const revealedBids = new Map(); // { nodeId: { bid, salt } }
const nodeAccount = new ethers.Wallet(process.env.PRIVATE_KEY); // The signing key for performing tasks

const router = Router()

async function commitBid(nodeId, bid) {
    const salt = Math.random().toString(36).substring(2);
    const commitment = generateCommitment(bid, salt);

    commitments.set(nodeId, { commitment, salt, bid });
    await publishTask("auction/bid_commit", { nodeId, commitment });
    console.log(`[${nodeId}] Committed bid: ${bid}, Salt: ${salt}`);
}

async function revealBid(nodeId) {
    const bidData = commitments.get(nodeId);
    console.log("bid data", bidData)
    if (!bidData) {
        console.log(`[${nodeId}] No commitment found`);
        return;
    }

    const { bid, salt } = bidData;
    await publishTask("auction/bid_reveal", { nodeId, bid, salt });
    console.log(`[${nodeId}] Revealed bid: ${bid}, Salt: ${salt}`);
}

function generateCommitment(bid, salt) {
    return keccak256(toUtf8Bytes(bid.toString() + salt));
}

function verifyBid(nodeId, bid, salt, commitment) {
    return generateCommitment(bid, salt) === commitment;
}

async function determineWinner() {
    let highestBid = 0;
    let winnerNodeId = null;

    for (const [nodeId, { bid, salt }] of revealedBids) {
        const commitment = commitments.get(nodeId)?.commitment;
        if (verifyBid(nodeId, bid, salt, commitment)) {
            if (bid > highestBid) {
                highestBid = bid;
                winnerNodeId = nodeId;
            }
        }
    }

    if (winnerNodeId) {
        await publishTask("auction/result", { winnerNodeId, highestBid });
        console.log(`[RESULT] Winner: ${winnerNodeId} with bid: ${highestBid}`);
    } else {
        console.log("[RESULT] No valid bids found");
    }
}

async function publishTask(topic, taskData) {
    console.log("abs")
    taskData.topic = topic;
    const jsonData = JSON.stringify(taskData);
    const rpcUrl = process.env.OTHENTIC_CLIENT_RPC_ADDRESS; // Replace with actual RPC server URL
    const hexData = Buffer.from(jsonData, "utf8").toString("hex");
    const payload = {
        jsonrpc: "2.0",
        method: "sendCustomMessage",
        params: [`0x${hexData}`],
        id: 1,
    };
    await axios.post(rpcUrl, payload);
}

async function handleAuctionStart(msg) {
    if (!msg.auctionId) {
        console.log("[Error] Auction ID is missing.");
        return;
    }

    console.log(`[Node] Received auction start event: ${msg.auctionId}`);
  
    const myBid = Math.floor(Math.random() * 200);
    await commitBid(nodeAccount.address, myBid);

    // All nodes start reveal phase independently
    setTimeout(() => {
        console.log(`[Node] Reveal phase started.`);
        revealBid(nodeAccount.address);

        // All nodes determine the winner independently
        setTimeout(() => {
            console.log(`[Node] Determining winner...`);
            determineWinner();
        }, 10000);
    }, 5000);
}

router.post("/message", async (req, res) => {

    console.log(`Node started and listening to bid_commit and bid_reveal topics.`);
    const { data } = req.body;
    const jsonData = Buffer.from(data.slice(2), "hex").toString("utf8");
    const parsedData = JSON.parse(jsonData);

    switch (parsedData.topic) {
        case "auction/start":
            await handleAuctionStart(parsedData);
            break;
        case "auction/bid_commit":
            if (commitments.has(parsedData.nodeId)) {
                console.log(`[Warn] Node ${parsedData.nodeId} has already committed a bid.`);
                return;
            }
            console.log(`[Commit Received] Node: ${parsedData.nodeId}, Commitment: ${parsedData.commitment}`);
            commitments.set(parsedData.nodeId, { commitment: parsedData.commitment });
            break;
        case "auction/bid_reveal":
            console.log(`[Reveal Received] Node: ${parsedData.nodeId}, Bid: ${parsedData.bid}, Salt: ${parsedData.salt}`);
            revealedBids.set(parsedData.nodeId, { bid: parsedData.bid, salt: parsedData.salt });
            break;
        case "auction/result":
            console.log(`[Winner declared] Node: ${parsedData.winnerNodeId} with Bid: ${parsedData.highestBid}`);
            if(parsedData.winnerNodeId === nodeAccount.address) {

                try {
                    const originalRpcUrl = process.env.OTHENTIC_CLIENT_RPC_ADDRESS; 
                    const updatedRpcUrl = new URL(originalRpcUrl);
                    updatedRpcUrl.port = "4003"; 

                    await axios.post(`http://execution-service:4003/task/execute`, {}, {
                        headers: { "Content-Type": "application/json" }
                    });
                  
                } catch (error) {
                    console.log(error);
                }

            }
            break;
    }
})

module.exports = router
