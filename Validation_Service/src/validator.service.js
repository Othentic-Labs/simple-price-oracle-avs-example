
import gpuMap from './gpuMap.json' assert {type: 'json'};
require('dotenv').config();
const dalService = require("./dal.service");
const oracleService = require("./oracle.service");

async function validate(proofOfTask) {

  try {
    /*
    TODO: When IPFS working again, encode IPFS
    
    const taskResult = await dalService.getIPfsTask(proofOfTask);
      var data = await oracleService.getPrice("ETHUSDT");
      const upperBound = data.price * 1.05;
      const lowerBound = data.price * 0.95;
    */
    let isApproved = true;
    
    //DONT FORGET THIS!!! WHEN IPFS, CHANGE THIS!!!

    var hwValOutput = JSON.parse(proofOfTask) 
    
    let pciDevice = hwValOutput["PCIID Device"];
    let pciVendor = hwValOutput["PCIID Vendor"];
    let subPciDevice = hwValOutput["Subsystem PCIID Device"];
    let subPciVendor = hwValOutput["Subsystem PCIID Vendor"];
    let uuid = hwValOutput["GPU UUID"];
    let vbios = hwValOutput["VBIOS"];
    let gpuName = hwValOutput["GPU Name"];
    let vbiosIntegrity = hwValOutput["VBIOS Integrity"];
    let kernelModuleCheck = hwValOutput["Kernel Module Check"];
    let secureBoot = hwValOutput["Secure Boot"];
    let kernelImageVerified = hwValOutput["Kernel Image Validation"];
    let virtualizationCheck = hwValOutput["Virtualization Check"];
    

    //GPu must b nvidia, literally no demand for AMD atm, and god forbid someone tries renting out an Intel
    if (pciVendor != 0x10de) {
      isApproved = false;
      console.log("not an NVIDIA GPU.");
    }
    
    //map pciid to gpu name
    mappedName = gpuMap[pciDevice]
    //if this doesn't match the gpu name extracted via nvml, shenanigans
    if (mappedName.lower() != gpuName.lower()) {
      isApproved = false;
      console.log(`Device PCIID ${pciDevice} maps to ${mappedName}, which doesn't match ${gpuName} the GPu name pulled from NVIDIA... Shenanigans likely`);
    }

    //reject if vbios tampered with 
    if (vbiosIntegrity != "pass") {
      isApproved = false;
      console.log("vbios tampering detected");
    }

    //check kernel module tainting... might move to yellow flags tbh, esp if gpu name matches pciid
    if (kernelModuleCheck != "true") {
      isApproved = false;
      console.log("kernel tainted! High likelihood of somebody spoofing their device ID");
    }

    //YELLOW FLAG, implement this later. Fail for now. check virtualization
    if (virtualizationCheck != "pass") {
      isApproved = false;
      console.log("Virtualization likely...");
    }

    //secureboot checks!

    if (secureBoot != "Y") {
      //yellow flag! Pass for now
      console.log("secure boot not enabled!");
    } else {
      //if kernel image not validated, reject!
      if (kernelImageVerified != "pass") {
        console.log("Kernel image not verified. Shenanigans likely");
        isApproved = false;
      }
    }
    


    return isApproved;
  } catch (err) {
    console.error(err?.message);
    return false;
  }
}

module.exports = {
  validate,
}