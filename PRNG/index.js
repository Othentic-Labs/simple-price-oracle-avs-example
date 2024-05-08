import express from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const NODE_RPC = process.env.NODE_RPC; // The URL for the RPC endpoint (the aggregator node)

const nodeAccount = new ethers.Wallet(process.env.PRIVATE_KEY); // The signing key for performing tasks

const app = express();
const port = 4002;
app.use(express.json());

const rpcUrl = 'https://rpc.ankr.com/eth_holesky/80921f6657bf5ad15fb4577b369c28c4f84a652625322575f085fceaa7e47653';
const provider = new ethers.JsonRpcProvider(rpcUrl);

// The AttestationCenter contract object
const attestationCenterAddress = '0x5f7E34f3c2e86F57B4952Ee8EE9b48C4bc4Edd30';
const attestationCenterAbi = [
    'function operators(uint) public view returns (address, uint, uint, uint8)',
    'function numOfOperators() public view returns (uint)'
];
const attestationCenterContract = new ethers.Contract(attestationCenterAddress, attestationCenterAbi, provider);

let currentPerformer;

/**
  * Performing tasks:
  * The "Task Performer" is chosen in a "Round Robin" fashion, meaning the
  * operators perform tasks in the order of their IDs: 0, 1, 2, ... etc.
  *
  * The round-robin scheme is trivially implemented by taking the block
  * number modulo the number of operators. This gives us a number in the range
  * [0..count-1], which we use as the ID of the chosen performer.
  */
provider.on('block', async (blockNumber) => {
    // Every operator knows who is supposed to send a task in the next 12 seconds
    const count = await attestationCenterContract.numOfOperators();
    const selectedOperatorId = BigInt(blockNumber) % count;
    const paymentDetails = await attestationCenterContract.operators(selectedOperatorId);

    currentPerformer = paymentDetails[0];

    // If the current performer is the operator itself, it performs the task
    if (currentPerformer === nodeAccount.address) {
        console.log(`Performing task for block ${blockNumber}...`);
        const proofOfTask = Date.now().toString();
        const taskDefinitionId = 0;
        const message = ethers.AbiCoder
            .defaultAbiCoder()
            .encode(
                ["string", "address", "uint16"],
                [proofOfTask, nodeAccount.address, taskDefinitionId]
            );
        const messageHash = ethers.keccak256(message);
        const sig = nodeAccount.signingKey.sign(messageHash).serialized;

        console.log(`Performing task with seed: ${proofOfTask}`);

        // The tasks consists of signing the current timestamp. The timestamp
        // will be used as the seed for our PRNG smart contract
        new ethers.JsonRpcProvider(NODE_RPC).send('sendTask', [
            proofOfTask, taskDefinitionId, nodeAccount.address, sig
        ]);
    }
    // const count = await attestationCenterContract.numOfOperators();
    // const selectedOperatorId = BigInt(blockNumber) % count;
    // const paymentDetails = await attestationCenterContract.operators(selectedOperatorId);
    //
    // currentPerformer = paymentDetails[0];
    //
    // if (currentPerformer === nodeAccount.address) {
    //     console.log(`Performing task for block ${blockNumber}...`);
    //     const proofOfTask = Date.now().toString();
    //     const taskDefinitionId = 0;
    //     const message = ethers.AbiCoder
    //         .defaultAbiCoder()
    //         .encode(
    //             ["string", "address", "uint16"],
    //             [proofOfTask, nodeAccount.address, taskDefinitionId]
    //         );
    //     const messageHash = ethers.keccak256(message);
    //     const sig = nodeAccount.signingKey.sign(messageHash).serialized;
    //
    //     console.log(`Performing task with seed: ${proofOfTask}`);
    //
    //     new ethers.JsonRpcProvider(NODE_RPC).send('sendTask', [
    //         proofOfTask, taskDefinitionId, nodeAccount.address, sig
    //     ]);
    // }
});

/**
  * AVS WebAPI endpoint:
  * This endpoint is responsible for validating that a task was performed by
  * the correct performer. It receives the performer from the Othentic node
  * and checks that it's the `currentPerformer`.
  */
app.post('/task/validate', (req, res) => {
    const performer = req.body.performer;
    let isValid = performer === currentPerformer;

    res.status(200);
    res.json({
        data: isValid,
        error: false,
        message: "Success"
    });
});

app.listen(port, () => { console.log(`AVS Implementation listening on localhost:${port}`); });

// Utility function for signing the proof-of-task
function sign (proofOfTask, taskDefinitionId) {
    const message = ethers.AbiCoder
        .defaultAbiCoder()
        .encode(
            ["string", "address", "uint16"],
            [proofOfTask, nodeAccount.address, taskDefinitionId]
        );
    const messageHash = ethers.keccak256(message);
    return nodeAccount.signingKey.sign(messageHash).serialized;
}
