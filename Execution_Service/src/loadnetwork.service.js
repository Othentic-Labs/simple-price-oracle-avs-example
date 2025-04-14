require('dotenv').config();

let bundler;

async function init() {
  if (!process.env.LOAD_NETWORK_API_KEY) {
    throw new Error("Missing LOAD_NETWORK_API_KEY in environment variables.");
  }

  const { BundlerSDK } = await import('bundler-upload-sdk');
  bundler = new BundlerSDK('https://upload.onchain.rs/', process.env.LOAD_NETWORK_API_KEY);
}

async function publishJSON(data) {
  try {
    if (!bundler) await init();

    const buffer = Buffer.from(JSON.stringify(data), 'utf-8');
    const txHash = await bundler.upload([
      {
        file: buffer,
        tags: {
          'content-type': 'application/json',
        },
      },
    ]);

    console.log(`✅ Uploaded JSON. TxHash: ${txHash}`);
    console.log(`🔗 View at: https://resolver.bot/bundle/${txHash}/0`);
    return txHash;
  } catch (error) {
    console.error('❌ Failed to upload JSON:', error.message);
    return '';
  }
}

module.exports = {
  init,
  publishJSON,
};
