import os
import json
import hvac
import subprocess
import dotenv
from web3 import Web3
from eth_account import Account
from eth_account.messages import encode_defunct
from eth_abi import encode
from cryptography import x509
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.x509.oid import NameOID

#Generate ephemeral keypair
#Returns tuple: ephemeral secret key, ephemeral public key
def ephemeralKeyGen():
    #generate ephemeral secret key, P256 is FIPS-compliant and Vault can sign it
    esk = ec.generate_private_key(ec.SECP256R1())
    #extract ephemeral public key
    epk = esk.public_key()
    return esk, epk

#Create the certificate signing request to get the keypair validated by vault
def create_csr(esk):
    csr_builder = x509.CertificateSigningRequestBuilder().subject_name(
        x509.Name([
            x509.NameAttribute(NameOID.COMMON_NAME, u"ephemeral-key"),
        ])
    )
    csr = csr_builder.sign(esk, hashes.SHA256())
    return csr

#Use Vault to sign the CSR via the PKI secrets engine.
def sign_csr_with_vault(csr_pem):
    vaultToken = os.environ.get("VAULT_TOKEN")
    vaultAddy = os.environ.get("VAULT_ADDR")
    vaultCaCertBundle = os.environ.get("CURL_CA_BUNDLE")
    # Initialize hvac.
    client = hvac.Client(url=vaultAddy, token=vaultToken, verify=vaultCaCertBundle)
    #role assigned to this endpt
    role = "ephemeral-role" 
    
    response = client.write(
        f"pki/sign/{role}",
        csr=csr_pem.decode('utf-8'),
        ttl="120s"
    )
    
    certificate = response['data']['certificate']
    if not validate_vault_certificate(certificate):
        raise ValueError("Invalid certificate received from Vault")
        
    return certificate

def validate_vault_certificate(certificate):
    try:
        cert = x509.load_pem_x509_certificate(certificate.encode())
        # Verify certificate hasn't expired
        
        # Verify issuer (adjust according to your CA)
        issuer = cert.issuer.get_attributes_for_oid(NameOID.COMMON_NAME)[0].value
        print("Certificate issuer: ", issuer)
        """
        if issuer != "Your-Expected-CA-Name":
            raise ValueError("Invalid certificate issuer")
        """
        return True
    except Exception as e:
        print(f"Certificate validation failed: {e}")
        return False

def hwValBash():
    
    
    try:
        output = json.loads(subprocess.check_output(["sudo", "./TasmanianDevil"], universal_newlines=True))
    except Exception as e:
        output = f"hw_validation_error: {str(e)}"
    print("Running ur worst nightmare: ", output)
    return output
    """

    #Dummy data for now
    output = {
    "PCIID Device": "0x2484",
    "PCIID Vendor": "0x10de",
    "Subsystem PCIID Device": "0x3908",
    "Subsystem PCIID Vendor": "0x1462",
    "GPU UUID": "GPU-bf218919-8350-f417-0e0a-4d9cfe06fc60",
    "VBIOS ID": "94.04.3a.40.63",
    "GPU Name": "NVIDIA GeForce RTX 3070",
    "VBIOS Integrity": "pass",
    "Kernel Module Check": "fail",
    "Secure Boot": "Y",
    "Kernel Image Validation": "pass",
    "Virtualization Check": "pass"
    }
    
    return output
    """


def publishDataToIpfs(data):
    proof_of_task = ""
    pinata_api_key = os.environ.get("PINATA_API_KEY")
    pinata_secret_api_key = os.environ.get("PINATA_SECRET_API_KEY")
    url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
    headers = {
        "pinata_api_key": pinata_api_key,
        "pinata_secret_api_key": pinata_secret_api_key,
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, data=json.dumps(data), headers=headers)
        response.raise_for_status()  # Raise an exception for HTTP errors
        resp_json = response.json()
        proof_of_task = resp_json.get("IpfsHash", "")
        print(f"proofOfTask: {proof_of_task}")
    except Exception as error:
        print("Error making API request to Pinata:", error)
    
    return proof_of_task

def deriveWallet(esk):
    eskBytes = esk.private_numbers().private_value.to_bytes(32, byteorder='big')
    account = Account.from_key(eskBytes)
    return account

def sendTask():
    rpcBaseAddy = os.environ.get("OTHENTIC_CLIENT_RPC_ADDRESS")
    print("rpcBaseAddy: ", rpcBaseAddy)
    #keygen
    esk, epk = ephemeralKeyGen()
    print("esk: ", esk, "epk: ", epk)

    vaultToken = os.environ.get("VAULT_TOKEN")
    vaultAddy = os.environ.get("VAULT_ADDR")
    vaultCaCertBundle = os.environ.get("CURL_CA_BUNDLE")
    print("vaultToken: ", vaultToken)
    print("vaultAddy: ", vaultAddy)
    print("vaultCaCertBundle: ", vaultCaCertBundle)
    #Vault is picky abt algo, if PKI works with a FIPS curve, should b fine
    """
    certReq = create_csr(esk)
    print("CSR: ", certReq)
    csrPem = certReq.public_bytes(serialization.Encoding.PEM)
    print("CSRPem: ", certReq)
    cert = sign_csr_with_vault(csrPem)
    print("Certificate: ", cert)
    """
    # Retrieve hardware validation output.
    hwValOutput = hwValBash()
    print("hwVal output!: ", hwValOutput)
    epkEncoded = epk.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')
    #DONT FORGET TO DECODE IT!!!
    hwValOutput["EPK"] = epkEncoded
    hwValOutput["Certificate"] = "DUMMY VAULT TODO"
    print("hwValOutput with key + certificate: ", hwValOutput)
    
    #PUT HWVAL INTO IPFS
    #TODO: BROKEN NOW, FOR NOW J RAW
    #proofOfTask = publishDataToIpfs(hwValOutput)
    proofOfTask = json.dumps(hwValOutput, sort_keys=True, separators=(',', ':'))
    print("proof of task: ", proofOfTask)
    taskDefId = 0
    #Get around it needing to be bytes for this abi encoder
    data = ("quokkas".encode("utf-8"))
    proofOfTaskBytes = proofOfTask.encode("utf-8")
    signed = esk.sign(proofOfTaskBytes, ec.ECDSA(hashes.SHA256()))
    signature = signed.hex()
    print("signature: ", signature)

    account = deriveWallet(esk)

    """
    payload = encode(
        ['string', 'bytes', 'address', 'uint16'],
        [proofOfTask, data, account.address, taskDefId]
    )
    """

    #Get around bytes being non-serializable
    performerAddress = account.address

    # Build the JSON-RPC payload, now including the hardware validation output.
    #DEPRECATED! USING WEB3 FOR JSONRPC
    """
    rpc_payload = {
        "jsonrpc": "2.0",
        "method": "sendTask",
        "params": [
            proofOfTask,
            data,
            taskDefId,
            performerAddress,
            signature
        ]
    }
    

    print(rpc_payload)
    """

    #TEST ON LOCALHSOT ONLY: REMOVE THIS WHEN/IF HOLESKY BACK UP
    rpcBaseAddy = "http://localhost:4003/task/execute"
    
    w3 = Web3(Web3.HTTPProvider(rpcBaseAddy))
    response = w3.manager.request_blocking(
        "sendTask", 
        [proofOfTask, data, taskDefId, performerAddress, signature])
    print("API response:", response.json())
    return response.json()

if __name__  == "__main__":
    dotenv.load_dotenv()
    sendTask()