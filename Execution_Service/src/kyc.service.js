const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
require('dotenv').config();

async function uploadKycImage() {
  const form = new FormData();
  const filePath = path.resolve(__dirname, "id.png");

  form.append("file", fs.createReadStream(filePath));

  try {
    var kycServerUrl= process.env.TEE_KYC_SERVER_URL;
    console.log("kycServerUrl", kycServerUrl);
    const response = await axios.post(kycServerUrl, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.log("✅ Server Response:");
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Upload failed:");
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// uploadKycImage();

module.exports = {
    uploadKycImage,
  }