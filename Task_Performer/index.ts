// function encode(data: Buffer): string {

// }

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

// gets a json object
function encode(data: any): string {
    const inputBuffer = Buffer.from(JSON.stringify(data), 'utf-8');
    const outputBuffer = encodeToBN254FieldElements(inputBuffer);
    return outputBuffer.toString('base64');
}

function decode(data: string): any {
    const inputBuffer = Buffer.from(data, 'base64');
    const outputBuffer = decodeFromBN254FieldElements(inputBuffer);
    return JSON.parse(outputBuffer.toString('utf-8'));
}

function main() {
    const data = {
        name: "Alice",
        age: 30,
        city: "New York"
    }

    const encoded = encode(data);
    const decoded = decode(encoded);

    console.log({encoded, decoded: JSON.stringify(decoded)});
}
main();