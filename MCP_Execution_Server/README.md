## AVS MCP Server



### Usage with Claude Desktop
Run 
```bash
npm run build
```

Add the following to your claude_desktop_config.json:

```JSON
{
  "mcpServers": {
    "AVSPerformer": {
      "command": "node",
      "args":["add_absolute_path/simple-price-oracle-avs-example/MCP_Execution_Server/build/index.js"],
      "env": {
        "PRIVATE_KEY_PERFORMER": ""
      }
    }
  }
}
```