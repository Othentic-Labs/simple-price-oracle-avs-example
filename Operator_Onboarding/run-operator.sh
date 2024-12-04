#!/bin/bash

# Validate private key
cast wallet address $1 || exit 1

SCRIPT_PATH="$(realpath "$0")"
SCRIPT_DIR="$(dirname "$SCRIPT_PATH")"

# Work from the script directory
cd $SCRIPT_DIR

source .env

NETWORK_NAME="p2p"
IMAGE_NAME="avs-operator"
AVS_WEBAPI_CONTAINER_NAME="AVS_WebAPI"

# the name of the operator container is deterministic with respect to the private key.
# we hash the private key, and take the first 8 bytes of the hash in base64
IDENTIFIER=$(echo -n $1 | openssl dgst -sha256 -binary | xxd -l 4 -p)
OPERATOR_CONTAINER_NAME="AVS_Operator_${IDENTIFIER}"

# docker start $AVS_WEBAPI_CONTAINER_NAME || docker run --name $AVS_WEBAPI_CONTAINER_NAME -d $IMAGE_NAME --network p2p
# When running multiple AVS operators on the same machine, boot only one instance of AVS WebAPI
docker start $AVS_WEBAPI_CONTAINER_NAME 2>/dev/null || docker run --name $AVS_WEBAPI_CONTAINER_NAME --env-file .env --network p2p --ip $AVS_WEBAPI -d $IMAGE_NAME avs-webapi || exit 1
docker start $OPERATOR_CONTAINER_NAME 2>/dev/null || docker run --name $OPERATOR_CONTAINER_NAME --env-file .env -e PRIVATE_KEY=$1 --network p2p -d $IMAGE_NAME node $1 || exit 1

echo "Operator container is running with name $OPERATOR_CONTAINER_NAME"
