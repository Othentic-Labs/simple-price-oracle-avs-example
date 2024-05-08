# 🍀 Othentic AVS Samples

## ▶️ Run the demos
We provide a sample docker-compose configuration which sets up the following
services:

- Aggregator node
- 3 Attester nodes
- AVS WebAPI endpoint
- TaskPerformer endpoint

To set up the environment, create a `.env` file with the usual Othentic
configurations (see the `.env.example`).

### Price Oracle AVS
To run the Price Oracle AVS demo, execute the following command:
```console
docker-compose up --build
```

### PRNG AVS
To run the Pseudo-Random Number Generator AVS demo, you must first deploy an
instance of the `PRNG` contract:
```console
source .env
cd PRNG/contracts/
forge script PRNGDeploy --rpc-url $L2_RPC --private-key $PRIVATE_KEY --broadcast -vvvv --verify --etherscan-api-key $L2_ETHERSCAN_API_KEY --chain $L2_CHAIN --sig="run(address)" $ATTESTATION_CENTER_ADDRESS
```

Then run the appropriate docker-compose configuration from the root directory:
```console
docker-compose -f prng.compose.yml up --build
```

> [!NOTE]
> Building the images might take a few minutes

### Updating the Othentic node version
To update the `othentic-cli` inside the docker images to the latest version, you
need to rebuild the images using the following command:
```console
docker-compose build --no-cache
```

## 🏗️ Architecture
The Othentic Attester nodes communicate with an AVS WebAPI endpoint which
validates tasks on behalf of the nodes. The attesters then sign the tasks based
on the AVS WebAPI response.

Attester nodes can either all communicate with a centralized endpoint or each
implement their own validation logic.

### AVS WebAPI
```
POST task/validate returns (bool) {"proofOfTask": "{proofOfTask}"};
```
