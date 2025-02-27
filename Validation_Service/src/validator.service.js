require('dotenv').config();
const dalService = require("./dal.service");
const crypto = require('crypto');
const oracleService = require("./oracle.service");
const gpuMap = require('./gpuMap.json'); 
async function validate(proofOfTask, sig) {

  try {
    /*
    TODO: When IPFS working again, encode IPFS
    
    const taskResult = await dalService.getIPfsTask(proofOfTask);
      var data = await oracleService.getPrice("ETHUSDT");
      const upperBound = data.price * 1.05;
      const lowerBound = data.price * 0.95;
    */
    let isApproved = true;

    const fromIpfs = await dalService.getIPfsTask(proofOfTask); 
    console.log(fromIpfs.gpuData);


    var hwValOutput = fromIpfs.gpuData;
    console.log(`data from ipfs: ${hwValOutput}`);
    let pciDevice = hwValOutput["PCIID Device"];
    let pciVendor = hwValOutput["PCIID Vendor"];
    let subPciDevice = hwValOutput["Subsystem PCIID Device"];
    let subPciVendor = hwValOutput["Subsystem PCIID Vendor"];
    let uuid = hwValOutput["GPU UUID"];
    let vbios = hwValOutput["VBIOS ID"];
    let gpuName = hwValOutput["GPU Name"];
    let vbiosIntegrity = hwValOutput["VBIOS Integrity"];
    let kernelModuleCheck = hwValOutput["Kernel Module Check"];
    let secureBoot = hwValOutput["Secure Boot"];
    let kernelImageVerified = hwValOutput["Kernel Image Validation"];
    let virtualizationCheck = hwValOutput["Virtualization Check"];
    let epk = hwValOutput["EPK"];
    let certificate = hwValOutput["Certificate"];
    let certCaPath = process.env.VAULT_CACERT;
    console.log(`CertCaPath: ${certCaPath}`);
    //FIRST! VALIDATE CERTIFICATE & SIGNATURES WITH SIG, EPK, CERTIFICATE
    const proofOfTaskString = JSON.stringify(hwValOutput, Object.keys(hwValOutput).sort(), '');
    const proofOfTaskBytes = Buffer.from(proofOfTaskString, 'utf-8');

    const verifier = crypto.createVerify('SHA256');
    verifier.update(proofOfTaskBytes);
    const signatureBuffer = Buffer.from(sig, 'hex');
    const publicKey = crypto.createPublicKey(epk);
    const isValid = verifier.verify(publicKey, signatureBuffer);
    console.log(`publicKey: ${publicKey}`);
    console.log(`signatureBuffer: ${signatureBuffer}`);

    if (!isValid) {
      console.log("signature rejected!!!")
    }

    /*
    if (validateCertificate(publicKey, certificate, certCaPath)) {
      console.log("Certificate approved!")
    }
      */

    //GPu must b nvidia, literally no demand for AMD atm, and god forbid someone tries renting out an Intel
    if (pciVendor != "0x10de") {
      isApproved = false;
      console.log("not an NVIDIA GPU.");
    }
    
    //map pciid to gpu name
    mappedName = gpuMap[pciDevice]
    //if this doesn't match the gpu name extracted via nvml, shenanigans
    if (String(mappedName).toLowerCase() != String(gpuName).toString().toLowerCase()) {
      isApproved = false;
      console.log(`Device PCIID ${pciDevice} maps to ${mappedName}, which doesn't match ${gpuName} the GPu name pulled from NVIDIA... Shenanigans likely`);
    } else {
      console.log(`Device PCIID ${pciDevice} maps to ${mappedName}, which matches ${gpuName}`);
    }

    //reject if vbios tampered with 
    if (vbiosIntegrity != "pass") {
      isApproved = false;
      console.log("vbios tampering detected");
    }

    //check kernel module tainting... might move to yellow flags tbh, esp if gpu name matches pciid
    if (kernelModuleCheck != "true") {
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

/*
function validateCertificate(epkPem, certificatePem, trustedCaCertPem) {
  const cert = new X509Certificate(certificatePem);

  const certPublicKey = cert.publicKey;

  // Convert the provided ephemeral public key PEM into a KeyObject
  const epkObject = createPublicKey(epkPem);

  // Export both public keys to a canonical PEM format (SPKI)
  const certPubKeyPem = certPublicKey.export({ type: 'spki', format: 'pem' });
  const epkNormalizedPem = epkObject.export({ type: 'spki', format: 'pem' });

  // Compare the two PEM strings
  if (certPubKeyPem.trim() !== epkNormalizedPem.trim()) {
    console.log("Certificate validation failed!");
    return false;
  }
  console.log("Certificate validation complete!");
    
  return true;
}
*/

module.exports = {
  validate,
}