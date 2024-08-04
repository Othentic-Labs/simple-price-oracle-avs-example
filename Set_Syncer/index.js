const execSync = require('child_process').execSync;
const { ethers } = require('ethers');
const dotenv = require('dotenv');
dotenv.config();
let private_key_syncer = process.env.PRIVATE_KEY_SYNCER;
if (!private_key_syncer.startsWith("0x")) {
    private_key_syncer = "0x" + private_key_syncer;
}
const ethersAddress = ethers.computeAddress(private_key_syncer);
process.env.PRIVATE_KEY = process.env.PRIVATE_KEY_DEPLOYER;
const output = execSync(`othentic-cli network set-syncer --syncer-address ${ethersAddress}`, { encoding: 'utf-8'});
console.log(output);


