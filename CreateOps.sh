#CreateOps.sh

PRIVATE_KEY_DEPLOYER=0xfd91457f617d2c26d4ca4c55fe4939e25229a23a30eacb82eb6794f6f9e44cec

RPC=https://1rpc.io/holesky
OPERATOR_ACCOUNT1="0x$(openssl rand -hex 32)"
OPERATOR_ADDRESS1=$(cast wallet address --private-key $OPERATOR_ACCOUNT1)

OPERATOR_ACCOUNT2="0x$(openssl rand -hex 32)"
OPERATOR_ADDRESS2=$(cast wallet address --private-key $OPERATOR_ACCOUNT2)

OPERATOR_ACCOUNT3="0x$(openssl rand -hex 32)"
OPERATOR_ADDRESS3=$(cast wallet address --private-key $OPERATOR_ACCOUNT3)

echo "Transferring 0.02 ETH on Holesky to all accounts..."

cast send \
    --rpc-url $RPC \
    --private-key $PRIVATE_KEY_DEPLOYER \
    --value 0.02ether \
    $OPERATOR_ADDRESS1

cast send \
    --rpc-url $RPC \
    --private-key $PRIVATE_KEY_DEPLOYER \
    --value 0.02ether \
    $OPERATOR_ADDRESS2

cast send \
    --rpc-url $RPC \
    --private-key $PRIVATE_KEY_DEPLOYER \
    --value 0.02ether \
    $OPERATOR_ADDRESS3

echo "Private key For Operator Account 1: $OPERATOR_ACCOUNT1"
echo "Operator 1 Address: $OPERATOR_ADDRESS1"
echo "Operator 1 Balance: $(cast balance --rpc-url $RPC $OPERATOR_ADDRESS1)"

echo "Private key For Operator Account 2: $OPERATOR_ACCOUNT2"
echo "Operator 2 Address: $OPERATOR_ADDRESS2"
echo "Operator 2 Balance: $(cast balance --rpc-url $RPC $OPERATOR_ADDRESS2)"

echo "Private key For Operator Account 3: $OPERATOR_ACCOUNT3"
echo "Operator 3 Address: $OPERATOR_ADDRESS3"
echo "Operator 3 Balance: $(cast balance --rpc-url $RPC $OPERATOR_ADDRESS3)"
