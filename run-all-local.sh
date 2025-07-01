#!/bin/bash

# Load environment variables
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

set -o allexport
source .env
set +o allexport
nvm use 22.6

SESSION="othentic"

# Kill previous session if exists
tmux kill-session -t $SESSION 2>/dev/null

# Start new tmux session with aggregator
tmux new-session -d -s $SESSION -n 'aggregator'
tmux send-keys -t $SESSION:0 "PRIVATE_KEY=$PRIVATE_KEY_AGGREGATOR othentic-cli node aggregator --json-rpc --delay 120000 --l1-chain $L1_CHAIN --l2-chain $L2_CHAIN" C-m

# Wait for aggregator to boot up (adjust if needed)
sleep 5

# Attester 1
tmux new-window -t $SESSION -n 'attester-1'
tmux send-keys -t $SESSION:1 "PRIVATE_KEY=$PRIVATE_KEY_ATTESTER1 othentic-cli node attester /ip4/127.0.0.1/tcp/9876/p2p/$OTHENTIC_BOOTSTRAP_ID --avs-webapi http://127.0.0.1 --l1-chain $L1_CHAIN --l2-chain $L2_CHAIN" C-m

# Attester 2
tmux new-window -t $SESSION -n 'attester-2'
tmux send-keys -t $SESSION:2 "PRIVATE_KEY=$PRIVATE_KEY_ATTESTER2 othentic-cli node attester /ip4/127.0.0.1/tcp/9876/p2p/$OTHENTIC_BOOTSTRAP_ID --avs-webapi http://127.0.0.1 --l1-chain $L1_CHAIN --l2-chain $L2_CHAIN" C-m

# Attester 3
tmux new-window -t $SESSION -n 'attester-3'
tmux send-keys -t $SESSION:3 "PRIVATE_KEY=$PRIVATE_KEY_ATTESTER3 othentic-cli node attester /ip4/127.0.0.1/tcp/9876/p2p/$OTHENTIC_BOOTSTRAP_ID --avs-webapi http://127.0.0.1 --l1-chain $L1_CHAIN --l2-chain $L2_CHAIN" C-m

# # Attester (malicious)
# tmux new-window -t $SESSION -n 'attester-malicious'
# tmux send-keys -t $SESSION:4 "PRIVATE_KEY=$PRIVATE_KEY_ATTESTER3 othentic-cli node attester /ip4/127.0.0.1/tcp/9876/p2p/$OTHENTIC_BOOTSTRAP_ID --avs-webapi http://127.0.0.1 --avs-webapi-port 4004" C-m

# Validation service (true)
tmux new-window -t $SESSION -n 'validation-true'
tmux send-keys -t "$SESSION:validation-true" "echo '[validation-true] Starting'; VALIDATOR_RESULT=true node ./Validation_Service/index.js" C-m

# Validation service (false)
tmux new-window -t $SESSION -n 'validation-false'
tmux send-keys -t "$SESSION:validation-false" "echo '[validation-false] Starting'; VALIDATOR_RESULT=false PORT=4004 node ./Validation_Service/index.js" C-m

# Execution service
tmux new-window -t $SESSION -n 'execution-service'
tmux send-keys -t "$SESSION:execution-service" "echo '[execution-service] Starting'; PRIVATE_KEY=$PRIVATE_KEY_PERFORMER OTHENTIC_CLIENT_RPC_ADDRESS=http://localhost:8545 node ./Execution_Service/index.js" C-m

# Attach session
tmux attach-session -t $SESSION
