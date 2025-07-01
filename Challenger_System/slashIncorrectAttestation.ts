const ethers = require("ethers");
const dotenv = require("dotenv");
dotenv.config();

// Struct types
type IncorrectAttestationSlashingDetails = {
  operator: string;
  isApproved: boolean;
  incorrectSignature: [bigint, bigint];
  taSignature: [bigint, bigint];
  attesterIds: number[];
};

type TaskInfo = {
  proofOfTask: string;
  data: string; // bytes in hex format
  taskPerformer: string;
  taskDefinitionId: number;
};

type DoubleAttestationSlashingDetails = {
    operator: string;
    trueBlsSignature: [bigint, bigint];
    falseBlsSignature: [bigint, bigint];
};

// Load environment variables
const PRIVATE_KEY = "";
const ATTESTATION_CENTER_CONTRACT_ADDRESS = "0xE1B40117cAbFD64a7C556765233699c357bF2BAD";

// ABI of the contract
const ABI = [
  `function slashOperatorForIncorrectAttestation(
      (address operator,bool isApproved,uint256[2] incorrectSignature,uint256[2] taSignature,uint256[] attesterIds) details,
      (string proofOfTask,bytes data,address taskPerformer,uint16 taskDefinitionId) task
    ) external`,

  `function slashOperatorForDoubleAttestation(
      (address operator,uint256[2] trueBlsSignature,uint256[2] falseBlsSignature) details,
      (string proofOfTask,bytes data,address taskPerformer,uint16 taskDefinitionId) task
    ) external`
];
async function main() {
  const provider = new ethers.JsonRpcProvider("");
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(ATTESTATION_CENTER_CONTRACT_ADDRESS, ABI, wallet);

  // const slashingDetails: IncorrectAttestationSlashingDetails = {
  //   operator: "0x6C22e6f7A6A272518119907e76FD42FAB8ba7869",
  //   isApproved: false,
  //   incorrectSignature: [
  //     BigInt("0x04fa4c0c81bc4c3c20f08332ad68c5507aeb1d226a224c9640cf3b62689a23ae"),
  //     BigInt("0x1116dcd61c18ca92b96e28264dc5f297359b2eebdb73cfc486ed2edb0870f4fd")
  //   ],
  //   taSignature: [
  //     BigInt("7552891097056300671951594289837602143682700445234611586565880644990274634819"),
  //     BigInt("21845290237922987930153341658232824013710888659443245439224008459362904436356")
  //   ],
  //   attesterIds: [8]
  // };
  const doubleAttestationSlashingDetails: DoubleAttestationSlashingDetails = {
    operator: "0xf5715961C550FC497832063a98eA34673ad7C816",
    trueBlsSignature: [
      BigInt("0x29da9ccf4ceb39f1e5ff57b5b0e2910605ece7442539d072d76805ff93471df0"), // BLS r from 'true' vote
      BigInt("0x0a42baedc593823bdd97cff3995ba3d80ba278a741c408c4fac1266d4d044bdb")
    ],
    falseBlsSignature: [
      BigInt("0x28b0156e203e8a9784f07606a557f70ac9c50ac42f0d07609353a84f2e54b1c7"), // BLS r from 'false' vote
      BigInt("0x1d64b8871705428d0c12e0f250b4d0007d5b345c0991129fa42734dc944530db")
    ]
  };

  const taskInfo: TaskInfo = {
    proofOfTask: "QmQieNUDWp4VudYvHLe9qhzxbybocq6kzmkBkTTjBo2dwR",
    data: "0x68656c6c6f", // If no additional data
    taskPerformer: "0xD52182D5e4131e39aFbca55F2AbEd521D9dEcCC5",
    taskDefinitionId: 0
  };

  try {
    // const tx = await contract.slashOperatorForIncorrectAttestation(slashingDetails, taskInfo);
    // console.log("📤 Slashing TX sent:", tx.hash);
    const tx2 = await contract.slashOperatorForDoubleAttestation(doubleAttestationSlashingDetails, taskInfo);
    console.log("📤 Slashing TX sent:", tx2.hash);

    await tx2.wait();
    // await tx2.wait();
    console.log("✅ Slashing complete");
  } catch (err: any) {
    console.error("❌ Error while slashing:", err.message);
  }
}

main();
