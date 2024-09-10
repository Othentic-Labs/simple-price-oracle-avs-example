require('dotenv').config();
const axios = require("axios");
const grpc = require('grpc');
const { DisperserClient } = require('../eigenDA/bindings/disperser/disperser_grpc_pb');
const { BlobStatusRequest, RetrieveBlobRequest } = require('../eigenDA/bindings/disperser/disperser_pb');

const EIGEN_ENDPOINT = 'disperser-holesky.eigenda.xyz:443';

var ipfsHost='';
var client;

function init() {
  ipfsHost = process.env.IPFS_HOST;
  client = new DisperserClient(EIGEN_ENDPOINT, grpc.credentials.createSsl());
}

async function getIPfsTask(cid) {
  const { data } = await axios.get(ipfsHost + cid);
  return {
    symbol: data.symbol,
    price: parseFloat(data.price),
  };
}

async function getEigenDATask(cid) {
  const statusRequest = new BlobStatusRequest();
  statusRequest.setRequestId(cid);
  const statusResponse = await getBlobStatus(client, statusRequest);
  const blobIndex = statusResponse.getInfo()?.getBlobVerificationProof()?.getBlobIndex();
  const batchHeaderHash = statusResponse.getInfo()?.getBlobVerificationProof()?.getBatchMetadata()?.getBatchHeaderHash();
  
  if (!blobIndex || !batchHeaderHash) {
    console.log('Blob dispersal is still in progress. Blob status:');
    console.log(statusResponse.toObject());
    return null;
  }
  
  const retrieveRequest = new RetrieveBlobRequest();
  retrieveRequest.setBlobIndex(blobIndex);
  retrieveRequest.setBatchHeaderHash(batchHeaderHash);
  const response = await retrieveBlob(client, retrieveRequest);
  const data = Buffer.from(response.getData()).toString('utf-8').replace(/\0/g, '');
  return JSON.parse(data);
}

function getBlobStatus(client, request) {
  return new Promise((resolve, reject) => {
    client.getBlobStatus(request, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
}

function retrieveBlob(client, request) {
  return new Promise((resolve, reject) => {
    client.retrieveBlob(request, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
}

module.exports = {
  init,
  getIPfsTask,
  getEigenDATask,
}