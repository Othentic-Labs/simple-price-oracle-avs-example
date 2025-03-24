import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ethers } from 'ethers';
import dotenv from 'dotenv'
import { GetPromptRequestSchema } from "@modelcontextprotocol/sdk/types.js";
dotenv.config();

var rpcBaseAddress = process.env.OTHENTIC_CLIENT_RPC_ADDRESS ?? "http://localhost:8545";
var privateKey = process.env.PRIVATE_KEY_PERFORMER;

const USER_AGENT = "binance-app/1.0";

// Create server instance
const server = new McpServer({
  name: "AVS MCP",
  version: "1.0.0"},
  {
  capabilities: {
    prompts: {}
  }
});

// @ts-ignore
server.prompt("send-task", async (request: any) => {
  const { pair = "ETHUSDT" } = request;

  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Can you get the price of ${pair}?`
        }
      },
      {
        role: "assistant",
        content: {
          type: "text",
          text: `I'll get the current price of ${pair} for you.`
        }
      },
      {
        role: "tool",
        name: "get-price",
        input: { pair }
      },
      {
        role: "tool",
        name: "get-price",
        output: {
          content: {
            type: "text",
            text: "The current price of ETHUSDT is $2,092.50."
          }
        }
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `Can you validate this price using the AVS network?`
        }
      },
      {
        role: "assistant",
        content: {
          type: "text",
          text: `I'll submit this price as proof of task for validation.`
        }
      },
      {
        role: "tool",
        name: "send-task",
        input: {
          proofOfTask: "2,092.50",
          data: "Price validation request"
        }
      }
    ],
    _meta: {
      description: "Retrieves the ETHUSDT price and submits it for validation using the AVS network."
    }
  };
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
      const res = (await response.json()).price;
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
      console.error("Error making call to AVS network:", error);
      return {
        content: [
          {
            type: "text",
            text: "Failed to submit Task",
          },
        ],
      };
    }
  },
);


async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AVS MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
});