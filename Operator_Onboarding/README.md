# Operator Onboarding Resources
This folder contains many helpful resources for developing a good operator on-boarding process to AVSs.

## Operator Onboarding Docker Image
In order to simplify the onboarding process of operators joining an AVS, an AVS can publish an all-in-one docker image for operators to use for various operator activities (registration and running a node). In this folder there is a demo setup for a docker image of that likeness: `Dockerfile.operator`.

The example uses the `Price_Oracle_AVS_JS` sample present in the samples directory, but this image can be adjusted for other AVSs.

### Prerequesites
- Foundry
In order to run the example operator onboarding docker image, you need to have already deployed a set of AVS smart contracts.

### Setup
All the steps are preformed from the root folder `avs-samples`.
This is crucial for the building process of the docker images.

Copy `.env.example` and fill in environment variables:
```
cp .env.example .env
```

Run the setup script:
```
chmod +x setup.sh
./setup.sh
```

Build the operator docker image:
```
docker build -f Operator_Onboarding/Dockerfile.operator -t avs-operator .
```

To register an operator:
```
docker run --rm --env-file .env -it avs-operator register
```

**You need to register the PRIVATE_KEY you've put in your .env file**

### Running
To run the AVS operator network, first you need to start the docker compose:
```
docker-compose -f Operator_Onboarding/docker-compose.aggregator.yml up
```
This will run the task performer service and the aggregator node.
To add operators to the network, run the command:

```
chmod +x ./Operator_Onboarding/run-operator.sh
./Operator_Onboarding/run-operator.sh <OPERATOR-PRIVATE-KEY>
```

You can view operator node logs through Docker Desktop