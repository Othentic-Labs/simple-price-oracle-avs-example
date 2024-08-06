const execSync = require('child_process').execSync;
const { ethers } = require('ethers');
const dotenv = require('dotenv');
dotenv.config();
let privateKeySyncer = process.env.PRIVATE_KEY_SYNCER;
if (!privateKeySyncer.startsWith("0x")) {
    privateKeySyncer = "0x" + privateKeySyncer;
}
const ethersAddress = ethers.computeAddress(privateKeySyncer);
process.env.PRIVATE_KEY = process.env.PRIVATE_KEY_DEPLOYER;
const output = execSync(`othentic-cli network set-syncer --syncer-address ${ethersAddress}`, { encoding: 'utf-8'});
console.log(output);


