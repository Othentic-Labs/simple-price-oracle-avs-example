# 🍀 Othentic AVS Samples

## ▶️ Run the demo
We provide a sample docker-compose configuration which sets up the following
services:

- Aggregator node
- 3 Attester nodes
- AVS WebAPI endpoint
- TaskPerformer endpoint

To set up the environment, create a `.env` file with the usual Othentic
configurations (see the `.env.example`), then run:
```console
docker-compose up --build
```

> [!NOTE]
> This might take a few minutes when building the images

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
