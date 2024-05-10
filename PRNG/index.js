import express from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const NODE_RPC = process.env.NODE_RPC; // The URL for the RPC endpoint (the aggregator node)

const nodeAccount = new ethers.Wallet(process.env.PRIVATE_KEY); // The signing key for performing tasks

const app = express();
const port = 4002;
app.use(express.json());

// L2 RPC provider
const rpcUrl = process.env.L2_RPC;
const provider = new ethers.JsonRpcProvider(rpcUrl);

// The AttestationCenter contract object
const attestationCenterAddress = process.env.ATTESTATION_CENTER_ADDRESS;
const attestationCenterAbi = [
    'function operators(uint) public view returns (address, uint, uint, uint8)',
    'function numOfOperators() public view returns (uint)'
];
const attestationCenterContract = new ethers.Contract(attestationCenterAddress, attestationCenterAbi, provider);

/**
  * Find the elected task performer for a certain block
  */
async function electedLeader (blockNumber) {
    const count = await attestationCenterContract.numOfOperators({ blockTag: blockNumber });
    const selectedOperatorId = (BigInt(blockNumber) % count) + 1n;
    const paymentDetails = await attestationCenterContract.operators(selectedOperatorId, { blockTag: blockNumber });
    return paymentDetails[0];
}

/**
  * Performing tasks:
  * The "Task Performer" is chosen in a "Round Robin" fashion, meaning the
  * operators perform tasks in the order of their IDs: 1, 2, 3, ... etc.
  *
  * The round-robin scheme is trivially implemented by taking the block
  * number modulo the number of operators (plus 1). This gives us a number in
  * the range [1..count], which we use as the ID of the chosen performer.
  */
provider.on('block', async (blockNumber) => {
    // Every operator knows who is supposed to send a task in the next block
    const currentPerformer = await electedLeader(blockNumber);

    // If the current performer is the operator itself, it performs the task
    if (currentPerformer === nodeAccount.address) {
        console.log(`Performing task for block ${blockNumber}...`);
        const proofOfTask = `${blockNumber}+${Date.now()}`;
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
});

/**
  * AVS WebAPI endpoint:
  * This endpoint is responsible for validating that a task was performed by
  * the correct performer. It receives the performer from the Othentic node
  * and checks that it's the `currentPerformer`.
  */
app.post('/task/validate', async (req, res) => {
    const { proofOfTask, performer } = req.body;
    const blockNumber = parseInt(proofOfTask.split('+')[0], 10); // Extract the block number from the proof of task
    const electedPerformer = await electedLeader(blockNumber); // Get the elected performer for that block

    console.log(`Validating task for block number: ${blockNumber}, Task Performer: ${performer}, Elected Performer: ${electedPerformer}`)

    let isValid = performer === electedPerformer; // Verify the performer is the elected performer

    res.status(200);
    res.json({
        data: isValid,
        error: false,
        message: "Success"
    });
});

app.listen(port, () => { console.log(`AVS Implementation listening on localhost:${port}`); });
