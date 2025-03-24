import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {ethers} from 'ethers';
import dotenv from 'dotenv'
dotenv.config();

var rpcBaseAddress = process.env.OTHENTIC_CLIENT_RPC_ADDRESS ?? "http://localhost:8545";
var privateKey = process.env.PRIVATE_KEY_PERFORMER;

// require('dotenv').config();

const NWS_API_BASE = "https://api.binance.com/";
const USER_AGENT = "binance-app/1.0";

// Create server instance
const server = new McpServer({
  name: "binance",
  version: "1.0.0",
});

  
server.tool(
    "get-price",
    "Get price data for a currency pair",
    {
      pair: z.string().describe("Pair to query price data"),
    },
    async ({ pair }) => {
        const headers = {
            "User-Agent": USER_AGENT,
            Accept: "application/json",
          };
        
        try {
            const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`, { headers });
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

        // const result = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`, headers);
        const res = (await response.json()).price;
        // sendTask() 

       
        console.log("Made call")
        console.log(res)
        
      
      return {
        content: [
          {
            type: "text",
            text: `Price of ${pair}: ${res}`,
          },
        ],
      };
    
} catch (error) {
    console.error("Error making Binance request:", error);
    return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve price data",
          },
        ],
      };
  }
    },
);

async function sendTask(proofOfTask: string, data: string, taskDefinitionId: any) {

    var wallet = new ethers.Wallet(privateKey ?? "");
    var performerAddress = wallet.address;
  
    data = ethers.hexlify(ethers.toUtf8Bytes(data));
    const message = ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes", "address", "uint16"], [proofOfTask, data, performerAddress, taskDefinitionId]);
    const messageHash = ethers.keccak256(message);
    const sig = wallet.signingKey.sign(messageHash).serialized;
  
    const jsonRpcBody = {
      jsonrpc: "2.0",
      method: "sendTask",
      params: [
        proofOfTask,
        data,
        taskDefinitionId,
        performerAddress,
        sig,
      ]
    };
      try {
        const provider = new ethers.JsonRpcProvider(rpcBaseAddress);
        const response = await provider.send(jsonRpcBody.method, jsonRpcBody.params);
        console.log("API response:", response);
    } catch (error) {
        console.error("Error making API request:", error);
    }
  }

server.tool(
    "send-task",
    "Send Task for validation to the AVS network",
    {
      proofOfTask: z.string().describe("prood of task"),
      data: z.string().describe("additional data"),
    },
    async ({ proofOfTask, data }) => {
      try {
          await sendTask(proofOfTask, data, 0)
        
      return {
        content: [
          {
            type: "text",
            text: `Sent successfully`,
          },
        ],
      };
    
} catch (error) {
    console.error("Error making Binance request:", error);
    return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve price data",
          },
        ],
      };
  }
    },
);

// Resources are a core primitive in the Model Context Protocol (MCP) that 
// allow servers to expose data and content that can be read by clients and used as context for LLM interactions.
// [protocol]://[host]/[path]
// postgres://database/customers/schema
// file:///home/user/documents/report.pdf

server.resource("Application Logs", "file:///logs/app.log", async () => {
    return {
        contents: [
          {
            uri: "file:///logs/app.log",
            mimeType: "text/plain",
            text: ""
          }
        ]
      };
})
// simplifying interactions between clients, users, and LLMs (Large Language Models).
server.prompt("explain-code", async (request: any) => {
    return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Generate a concise but descriptive commit message for these changes:\n\n${request.params.arguments?.changes}`
            }
          }
        ]
      };
})

  async function main() {
    const transport = new StdioServerTransport();
    // const transport2 = new SSEServerTransport();
    await server.connect(transport);
    console.error("Binance MCP Server running on stdio");
  }
  
  main().catch((error) => {
    console.error("Fatal error in main():", error);
  });