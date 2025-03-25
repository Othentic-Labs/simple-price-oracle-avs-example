## AVS MCP Server

The AVS MCP server acts as an interface between the AI Agents and the AVS network, enabling you to execute any AVS Tasks. The following MCP server includes functionality to fetch the `ETHUSDT` price and call the `sendTask` RPC method to trigger the AVS [Task](https://docs.othentic.xyz/main/avs-framework/othentic-consensus/task-and-task-definitions#task).

## Usage with Claude Desktop 
1. Ensure the AVS network is running

Make sure your AVS network is up and running before proceeding. Check the [Quickstart Guide](https://docs.othentic.xyz/main/avs-framework/quick-start) to run an AVS network.

2. Build the MCP server

Run the following command to compile the server:

```bash
cd MCP_Execution_Server
npm i
npm run build
```

3. Add the following to your claude_desktop_config.json:

Note: Replace `ADD_ABSOLUTE_PATH` and `YOUR_PERFORMER_PRIVATE_KEY_HERE` with the actuals

```JSON
{
  "mcpServers": {
    "AVSPerformer": {
      "command": "node",
      "args":["ADD_ABSOLUTE_PATH/simple-price-oracle-avs-example/MCP_Execution_Server/build/index.js"],
      "env": {
        "PRIVATE_KEY_PERFORMER": "YOUR_PERFORMER_PRIVATE_KEY_HERE",
        "OTHENTIC_CLIENT_RPC_ADDRESS":"http://localhost:8545",
        "PINATA_API_KEY": "7824585a98fe36414d68",
        "PINATA_SECRET_API_KEY": "41a53a837879721969e73008d91180df30dbc66097c7f75f08cd5489176b43ea",
      }
    }
  }
}
```

4. Sample Prompts

You can use the following prompts to interact with the AVS MCP server:

```bash
can you get the price of ETHUSDT?
can you validate this price using AVS network?
```

5. Verify the On-Chain Transaction

Check the on-chain transaction in the Attestation Center contract to confirm execution within the AVS network.

