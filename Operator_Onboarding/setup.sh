#!/bin/bash

# Name of the Docker network
NETWORK_NAME="p2p"

# Check if the network already exists
if docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
    echo "Docker network '$NETWORK_NAME' already exists."
else
    # Create the Docker network
    docker network create "$NETWORK_NAME" --subnet 10.8.0.0/16 --gateway 10.8.0.1
    echo "Docker network '$NETWORK_NAME' created."
fi