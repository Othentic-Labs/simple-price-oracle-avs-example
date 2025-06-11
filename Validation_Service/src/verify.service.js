const axios = require("axios");
const crypto = require("crypto");
const dalService = require("./dal.service");
/**
 * Verifies a signed identity using the SGX quote and Ed25519 public key.
 * @param {Object} inputJson - JSON object containing `response.quote`, `response.signature`, `response.identity`
 * @returns {Promise<boolean>} - True if valid, False otherwise
 */
async function verify(proofOfTask) {
    console.log("Starting verification", proofOfTask);
  
  try {
    const inputJson = await dalService.getIPfsTask(proofOfTask);
    console.log("in the verifificatin", inputJson);
    // Step 1: Extract fields
    const response = inputJson.response;
    const quote = response.quote;
    const signatureB64 = response.signature;
    const identity = response.identity;

    if (!quote || !signatureB64 || !identity) {
      throw new Error("Missing required field in input JSON");
    }

    // Step 2: Send quote to PCCS API
    const apiResp = await axios.post(
      "https://pccs.scrtlabs.com/dcap-tools/quote-parse",
      new URLSearchParams({ quote }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const reportDataHex = apiResp.data?.quote?.report_data;
    console.log("reportDataHex", reportDataHex);
    if (!reportDataHex) throw new Error("report_data missing in quote-parse response");

    // Step 3: Extract public key (first 32 bytes of report_data)
    const reportData = Buffer.from(reportDataHex, "hex");
    const pubKeyBytes = reportData.slice(0, 32);
    console.log("pubKeyBytes", pubKeyBytes);

    // Step 4: Wrap public key in DER prefix for Ed25519
    const derPrefix = Buffer.from("302a300506032b6570032100", "hex"); // ASN.1 header for Ed25519
    const spkiKey = Buffer.concat([derPrefix, pubKeyBytes]);
    console.log("spkiKey", spkiKey);

    // Step 5: Prepare message and decode signature
    const message = Buffer.from(JSON.stringify(identity, Object.keys(identity).sort()));
    const signature = Buffer.from(signatureB64, "base64");
    console.log("message", message);
    console.log("signature", signature);
    // Step 6: Verify signature
    const isValid = crypto.verify(null, message, {
      key: spkiKey,
      format: "der",
      type: "spki"
    }, signature);
    console.log("isValid", isValid);

    return isValid;
  } catch (err) {
    console.error("Verification error:", err.message);
    return false;
  }
}

module.exports = { verify };
