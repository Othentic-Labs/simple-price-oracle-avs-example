#!/bin/bash

SCRIPT=$(realpath "$0")
SCRIPTPATH=$(dirname "$SCRIPT")

cd $SCRIPTPATH

source ../.env

ENDPOINT1=http://10.8.0.2:8545
ENDPOINT2=http://10.8.0.3:8545
ENDPOINT3=http://10.8.0.4:8545

cd AVS_LOGIC
forge script SignInLivelinessRegistry --rpc-url $L2_RPC --private-key $PRIVATE_KEY_VALIDATOR1 --broadcast -vvvv --sig="run(address,string)" $ATTESTATION_CENTER_ADDRESS $ENDPOINT1
forge script SignInLivelinessRegistry --rpc-url $L2_RPC --private-key $PRIVATE_KEY_VALIDATOR2 --broadcast -vvvv --sig="run(address,string)" $ATTESTATION_CENTER_ADDRESS $ENDPOINT2
forge script SignInLivelinessRegistry --rpc-url $L2_RPC --private-key $PRIVATE_KEY_VALIDATOR3 --broadcast -vvvv --sig="run(address,string)" $ATTESTATION_CENTER_ADDRESS $ENDPOINT3
