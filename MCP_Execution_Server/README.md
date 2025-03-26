# AVS MCP Server

The AVS MCP server acts as an interface between the AI Agents and the AVS network, enabling you to execute any AVS Tasks. The following MCP server includes functionality to fetch the `ETHUSDT` price and call the `sendTask` RPC method to trigger the AVS [Task](https://docs.othentic.xyz/main/avs-framework/othentic-consensus/task-and-task-definitions#task).

## Components
### Tools  

- **get-price**: Fetches the price of a cryptocurrency pair using the Binance API.  
  - **Input:**  
    - `pair` (string): The name of the cryptocurrency pair (e.g., `ETHUSDT`).  

- **send-task**  
  - **Input:**  
    - `price` (string): Price of the pair.  
    - `data` (string): Any additional data.  


## Usage with Claude Desktop
1. **Ensure the AVS Network is running**

Make sure your AVS network is up and running before proceeding. Refer to the [Quickstart Guide](https://docs.othentic.xyz/main/avs-framework/quick-start) for instructions on running an AVS network.

2. **Build the MCP server**

Run the following commands to compile the server:

```bash
cd MCP_Execution_Server
npm i
npm run build
```

3. **Configure Claude Desktop**
   
Add the configuration for the MCP Server in your `claude_desktop_config.json` file. Detailed instructions are available in the Claude Desktop [Configuration Guide](https://modelcontextprotocol.io/quickstart/user).

Replace `ADD_ABSOLUTE_PATH` and `YOUR_PERFORMER_PRIVATE_KEY_HERE` with the appropriate values:

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

4. **Sample Prompts**
   
You can interact with the AVS MCP Server using prompts such as:

```bash
can you get the price of ETHUSDT?
can you validate this price using AVS network?
```

5. **Verify the On-Chain Transaction**

Check the on-chain transaction in the Attestation Center contract to confirm execution within the AVS network.

