## AVS MCP Server

The AVS MCP server acts as an interface between the AI Agents and the AVS network, enabling you to execute any AVS Tasks. It includes functionality to fetch the `ETHUSDT` price and call the `sendTask` RPC method.

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
        "OTHENTIC_CLIENT_RPC_ADDRESS":"http://localhost:8545"
      }
    }
  }
}
```

4. Sample Prompts

You can use the following prompts to interact with the AVS MCP server:

```bash
can you get the price of ETHUSDT?
can you validate this proof of task 2077.14 using AVS network?
```
