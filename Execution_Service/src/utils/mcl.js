const mcl = require('mcl-wasm');
const { ethers } = require('ethers');

const FIELD_ORDER = BigInt(
    '0x30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47',
);

let initialized = false;
async function init() {
    if (!initialized) {
        await mcl.init(mcl.BN_SNARK1);
        mcl.setMapToMode(mcl.BN254);
        initialized = true;
    }
}

function getSigningKey(seed) {
    return parseFr(prefixSeed(seed));
}

function getPublicKey(signingKey) {
    const pubKey = mcl.mul(g2(), signingKey);
    pubKey.normalize();
    return pubKey; 
}

function sign(signingKey, message) {
    const messagePoint = hashToPoint(message, domain());
    const signature = mcl.mul(messagePoint, signingKey);
    signature.normalize();
    const sig = g1ToHex(signature);
    const jsonSig = {
        x: sig[0],
        y: sig[1]
    }
    return JSON.stringify(jsonSig);
}

function parseFr(hex) {
    if (!ethers.isHexString(hex)) {
        throw new Error('Invalid hex string');
    }
    const fr = new mcl.Fr();
    fr.setHashOf(hex);
    return fr;
}

function prefixSeed(seed) {
    return seed.startsWith('0x') ? seed : `0x${seed}`;
}

function hashToPoint(message, domain) {
    if (!ethers.isHexString(message)) {
        throw new Error('message is expected to be hex string');
    }
    
    const _msg = ethers.getBytes(message);
    const [e0, e1] = hashToField(domain, _msg, 2);
    const p0 = mapToPoint(e0);
    const p1 = mapToPoint(e1);
    const p = mcl.add(p0, p1);
    p.normalize();
    return p;
}

function mapToPoint(e) {
    const e1 = new mcl.Fp();
    e1.setStr((ethers.toBigInt(e) % FIELD_ORDER).toString());
    return e1.mapToG1();
}

function hashToField(domain, msg, count) {
    const u = 48;
    const _msg = expandMsg(domain, msg, count * u);
    const els = [];
    for (let i = 0; i < count; i++) {
      const el = ethers.toBigInt(_msg.slice(i * u, (i + 1) * u)) % FIELD_ORDER;
      els.push(el);
    }
    return els;
}

function toBigEndian(p) {
    return p.serialize().reverse();
}

function g1ToHex(p) {
    p.normalize();
    const x = ethers.hexlify(toBigEndian(p.getX()));
    const y = ethers.hexlify(toBigEndian(p.getY()));
    return [x, y];
}

function g2() {
    const g2 = new mcl.G2();
    g2.setStr(
        '1 0x1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed 0x198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c2 0x12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa 0x090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b',
    );
    return g2;
}

function expandMsg(domain, msg, outLen) {
    if (domain.length > 32) {
      throw new Error('bad domain size');
    }
  
    const out = new Uint8Array(outLen);
  
    const len0 = 64 + msg.length + 2 + 1 + domain.length + 1;
    const in0 = new Uint8Array(len0);
    // zero pad
    let off = 64;
    // msg
    in0.set(msg, off);
    off += msg.length;
    // l_i_b_str
    in0.set([(outLen >> 8) & 0xff, outLen & 0xff], off);
    off += 2;
    // I2OSP(0, 1)
    in0.set([0], off);
    off += 1;
    // DST_prime
    in0.set(domain, off);
    off += domain.length;
    in0.set([domain.length], off);
  
    const b0 = ethers.sha256(in0);
  
    const len1 = 32 + 1 + domain.length + 1;
    const in1 = new Uint8Array(len1);
    // b0
    in1.set(ethers.getBytes(b0), 0);
    off = 32;
    // I2OSP(1, 1)
    in1.set([1], off);
    off += 1;
    // DST_prime
    in1.set(domain, off);
    off += domain.length;
    in1.set([domain.length], off);
  
    const b1 = ethers.sha256(in1);
  
    // b_i = H(strxor(b_0, b_(i - 1)) || I2OSP(i, 1) || DST_prime);
    const ell = Math.floor((outLen + 32 - 1) / 32);
    let bi = b1;
  
    for (let i = 1; i < ell; i++) {
      const ini = new Uint8Array(32 + 1 + domain.length + 1);
      const nb0 = bytes32ArrayZeroPadding(ethers.toBeArray(ethers.zeroPadValue(ethers.getBytes(b0), 32)));
      const nbi = bytes32ArrayZeroPadding(ethers.toBeArray(ethers.zeroPadValue(ethers.getBytes(bi), 32)));
      const tmp = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        tmp[i] = nb0[i] ^ nbi[i];
      }
  
      ini.set(tmp, 0);
      let off = 32;
      ini.set([1 + i], off);
      off += 1;
      ini.set(domain, off);
      off += domain.length;
      ini.set([domain.length], off);
  
      out.set(ethers.getBytes(bi), 32 * (i - 1));
      bi = ethers.sha256(ini);
    }
  
    out.set(ethers.getBytes(bi), 32 * (ell - 1));
    return out;
}
  
function bytes32ArrayZeroPadding(array) {
    const resultedArray = new Uint8Array(32);
    const startPos = 32 - array.length;
    for (let i = startPos; i < 32; i++) {
      resultedArray[i] = array[i-startPos];
    }
    return resultedArray;
}

function domain() {
    return ethers.getBytes(
        ethers.solidityPackedKeccak256(['string'], ['TasksManager'])
    );
}

module.exports = {
    init,
    getSigningKey,
    getPublicKey,
    sign
};
