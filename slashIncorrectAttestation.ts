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
const RPC_URL = process.env.RPC_URL!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const ATTESTATION_CENTER_CONTRACT_ADDRESS = "0x";

// ABI of the contract
const ABI = [
  "function slashOperatorForIncorrectAttestation((address,bool,uint256[2],uint256[2],uint256[]),(string,bytes,address,uint16)) external",
  "function slashOperatorForDoubleAttestation((address,uint256[2],uint256[2]),(string,bytes,address,uint16)) external"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(ATTESTATION_CENTER_CONTRACT_ADDRESS, ABI, wallet);

  const slashingDetails: IncorrectAttestationSlashingDetails = {
    operator: "0xOperatorAddressHere",
    isApproved: true,
    incorrectSignature: [
      BigInt("0xSignatureR1"),
      BigInt("0xSignatureS1")
    ],
    taSignature: [
      BigInt("0xSignatureR2"),
      BigInt("0xSignatureS2")
    ],
    attesterIds: [1, 2, 3]
  };

  const doubleAttestationSlashingDetails: DoubleAttestationSlashingDetails = {
    operator: "0xOperatorAddressHere",
    trueBlsSignature: [
      BigInt("0xTrueR"), // BLS r from 'true' vote
      BigInt("0xTrueS")
    ],
    falseBlsSignature: [
      BigInt("0xFalseR"), // BLS r from 'false' vote
      BigInt("0xFalseS")
    ]
  };


  const taskInfo: TaskInfo = {
    proofOfTask: "QmPoTHash",
    data: "0x", // If no additional data
    taskPerformer: "0xPerformerAddressHere",
    taskDefinitionId: 0
  };

  try {
    const tx = await contract.slashOperatorForIncorrectAttestation(slashingDetails, taskInfo);
    console.log("📤 Slashing TX sent:", tx.hash);
    const tx2 = await contract.slashOperatorForDoubleAttestation(doubleAttestationSlashingDetails, taskInfo);
    console.log("📤 Slashing TX sent:", tx2.hash);

    await tx.wait();
    await tx.wait();
    console.log("✅ Slashing complete");
  } catch (err: any) {
    console.error("❌ Error while slashing:", err.message);
  }
}

main();
