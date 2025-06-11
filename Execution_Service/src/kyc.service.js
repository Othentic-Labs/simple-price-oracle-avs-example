const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

async function uploadKycImage() {
  const form = new FormData();
  const filePath = path.resolve(__dirname, "id.png");

  form.append("file", fs.createReadStream(filePath));

  try {
    
    const response = await axios.post("http://host.docker.internal:8000/api/kyc", form, {
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