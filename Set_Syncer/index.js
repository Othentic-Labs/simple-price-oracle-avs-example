const execSync = require('child_process').execSync;
const { ethers } = require('ethers');
const dotenv = require('dotenv');
dotenv.config();
let privateKeyDeployer = process.env.PRIVATE_KEY_DEPLOYER;
if (!privateKeyDeployer || privateKeyDeployer.startsWith("#")) {
    console.error("PRIVATE_KEY_DEPLOYER is not set.");
    process.exit(1);
}
let privateKeySyncer = process.env.PRIVATE_KEY_SYNCER;
if (!privateKeySyncer || privateKeySyncer.startsWith("#")) {
    console.error("PRIVATE_KEY_SYNCER is not set.");
    process.exit(1);
}
if (!privateKeySyncer.startsWith("0x")) {
    privateKeySyncer = "0x" + privateKeySyncer;
}
const ethersAddress = ethers.computeAddress(privateKeySyncer);
process.env.PRIVATE_KEY = privateKeyDeployer;
const output = execSync(`othentic-cli network set-syncer --syncer-address ${ethersAddress}`, { encoding: 'utf-8'});
console.log(output);



