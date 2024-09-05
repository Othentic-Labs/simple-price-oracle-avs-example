import * as grpc from 'grpc';
 
import { DisperserClient } from './disperser/disperser_grpc_pb';
import { DisperseBlobRequest, DisperseBlobReply, BlobStatusRequest, BlobStatusReply, RetrieveBlobRequest, RetrieveBlobReply } from './disperser/disperser_pb';

const EIGEN_ENDPOINT = 'disperser-holesky.eigenda.xyz:443';

function encodeToBN254FieldElements(inputBuffer: Buffer): Buffer {
    const nullByte = Buffer.from([0x00]);
    const byteGroupSize = 31;
    const outputBuffers: Buffer[] = [];
  
    for (let i = 0; i < inputBuffer.length; i += byteGroupSize) {
      // Extract the next 31-byte chunk from the input buffer
      const chunk = inputBuffer.subarray(i, i + byteGroupSize);
  
      // Prepend the chunk with a null byte and push it to the output array
      outputBuffers.push(Buffer.concat([nullByte, chunk]));
    }
  
    // Concatenate all chunks into a single output buffer
    return Buffer.concat(outputBuffers);
}

function decodeFromBN254FieldElements(inputBuffer: Buffer): Buffer {
    const byteGroupSize = 32; // Original 31 bytes + 1 prepended null byte
    const outputBuffers: Buffer[] = []; // Array to hold the buffer chunks after removing null bytes
  
    for (let i = 0; i < inputBuffer.length; i += byteGroupSize) {
      // Calculate the end index for slicing, making sure not to exceed the buffer length
      const end = Math.min(i + byteGroupSize, inputBuffer.length);
  
      // Extract the chunk, skipping the first byte (the prepended null byte)
      const chunk = inputBuffer.slice(i + 1, end);
  
      // Push the chunk to the output array
      outputBuffers.push(chunk);
    }
  
    // Concatenate all chunks into a single output buffer
    return Buffer.concat(outputBuffers);
}

function encode(data: any): string {
    const inputBuffer = Buffer.from(JSON.stringify(data), 'utf-8');
    const outputBuffer = encodeToBN254FieldElements(inputBuffer);
    return outputBuffer.toString('base64');
}

function disperseBlob(client: DisperserClient, request: DisperseBlobRequest): Promise<DisperseBlobReply> {
    return new Promise((resolve, reject) => {
        client.disperseBlob(request, (err: grpc.ServiceError | null, response: DisperseBlobReply ) => {
            if (err) {
                reject(err);
            } else {
                resolve(response);
            }
        });
    });
}

function getBlobStatus(client: DisperserClient, request: BlobStatusRequest): Promise<BlobStatusReply> {
    return new Promise((resolve, reject) => {
        client.getBlobStatus(request, (err: grpc.ServiceError | null, response: BlobStatusReply) => {
            if (err) {
                reject(err);
            } else {
                resolve(response);
            }
        });
    });
}

function retrieveBlob(client: DisperserClient, request: RetrieveBlobRequest): Promise<RetrieveBlobReply> {
    return new Promise((resolve, reject) => {
        client.retrieveBlob(request, (err: grpc.ServiceError | null, response: RetrieveBlobReply) => {
            if (err) {
                reject(err);
            } else {
                resolve(response);
            }
        });
    });
}

function decode(data: string): any {
    const inputBuffer = Buffer.from(data, 'base64');
    const outputBuffer = decodeFromBN254FieldElements(inputBuffer);
    return JSON.parse(outputBuffer.toString('utf-8'));
}

async function disperseBlobRoutine() {
    const client = new DisperserClient(EIGEN_ENDPOINT, grpc.credentials.createSsl());

    const data = {
        name: 'Alice',
        age: 30,
        city: 'New York'
    }
    const encoded = encode(data);
    const request = new DisperseBlobRequest();
    request.setData(encoded);
    const response = await disperseBlob(client, request);
    console.log(response.toObject());
}

async function getBlobStatusRoutine() {
    const client = new DisperserClient(EIGEN_ENDPOINT, grpc.credentials.createSsl());

    const REQUEST_ID = 'OGEyYTVjOWI3Njg4MjdkZTVhOTU1MmMzOGEwNDRjNjY5NTljNjhmNmQyZjIxYjUyNjBhZjU0ZDJmODdkYjgyNy0zMTM3MzIzNTM1MzMzNTMyMzgzNzM2MzMzMzMzMzIzNDMyMzIzNjJmMzAyZjMzMzMyZjMxMmYzMzMzMmZlM2IwYzQ0Mjk4ZmMxYzE0OWFmYmY0Yzg5OTZmYjkyNDI3YWU0MWU0NjQ5YjkzNGNhNDk1OTkxYjc4NTJiODU1';
    const request = new BlobStatusRequest();
    request.setRequestId(REQUEST_ID);
    const response = await getBlobStatus(client, request);
    console.log(response.toObject());
    console.log(response.toObject().info?.blobVerificationProof?.batchMetadata);
}

async function retrieveBlobRoutine() {
    const client = new DisperserClient(EIGEN_ENDPOINT, grpc.credentials.createSsl());

    const BLOB_INDEX = 68;
    const batchHeaderHash = 'JIEh2k1GTbaxNwFBQz3TP4i2i4zdh3SdC8qypxeZlFM=';
    const request = new RetrieveBlobRequest();
    request.setBlobIndex(BLOB_INDEX);
    request.setBatchHeaderHash(batchHeaderHash);
    const response = await retrieveBlob(client, request);
    console.log(response.toObject());
}

// disperseBlobRoutine();
// getBlobStatusRoutine()
retrieveBlobRoutine();