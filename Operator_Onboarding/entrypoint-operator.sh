#!/bin/bash

# NOTICE: docker needs to be ran with env file

# node
if [ "$1" = "node" ]; then
    othentic-cli node attester "/ip4/${OTHENTIC_BOOTSTRAP_IP}/tcp/9876/p2p/${OTHENTIC_BOOTSTRAP_ID}" --avs-webapi "http://${AVS_WEBAPI}" --json-rpc
fi

# avs-webapi
if [ "$1" = "avs-webapi" ]; then
    cd AVS_WebAPI
    node index.js
fi

# needs to be ran interactively and deleted immediately
if [ "$1" = "register" ]; then
    othentic-cli operator register
fi
