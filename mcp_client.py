#pip install aviationstack-mcp
import os
import asyncio
import sys

from dotenv import load_dotenv
from langchain_mcp_adapters.client import MultiServerMCPClient  # type: ignore[import-not-found]
from langchain_groq import ChatGroq

load_dotenv()

def create_mcp_client():
    tavily_api_key = os.getenv("TAVILY_API_KEY")
    aviation_api_key = os.getenv("AVIATIONSTACK_API_KEY")
    return MultiServerMCPClient(
        {
            "tavily": {
                "transport": "streamable_http",
                "url": f"https://mcp.tavily.com/mcp/?tavilyApiKey={tavily_api_key}"
            },
            "aviationstack": {
                "transport": "stdio",
                "command": sys.executable,
                "args": [
                    "-m",
                    "aviationstack_mcp",
                    "mcp",
                    "run"
                ],
                "env": {
                    "AVIATION_STACK_API_KEY": aviation_api_key
                }
            }
        }
    )

async def tavily_mcp_search(query: str):
    client = create_mcp_client()
    tools = await client.get_tools()
    search_tool = next((t for t in tools if t.name == "tavily_search"), None)
    if not search_tool:
        return "Tavily search tool unavailable"
    result = await search_tool.ainvoke({"query": query})
    return result

async def get_flight_info():
    client = create_mcp_client()
    tools = await client.get_tools()
    airports_tool = next((t for t in tools if t.name == "list_airports"), None)
    airlines_tool = next((t for t in tools if t.name == "list_airlines"), None)
    
    airports = await airports_tool.ainvoke({}) if airports_tool else "Airport tool unavailable"
    airlines = await airlines_tool.ainvoke({}) if airlines_tool else "Airline tool unavailable"
    return airports, airlines

async def aviation_mcp_call(
    tool_name: str,
    tool_args: dict = None
):
    client = create_mcp_client()
    tools = await client.get_tools()
    tool = next((t for t in tools if t.name == tool_name), None)
    if not tool:
        return f"Tool {tool_name} unavailable"
    result = await tool.ainvoke(tool_args or {})
    return result

async def get_airports():
    client = create_mcp_client()
    tools = await client.get_tools()
    tool = next((t for t in tools if t.name == "list_airports"), None)
    if not tool:
        return "Airport tool unavailable"
    return await tool.ainvoke({})

async def get_airlines():
    client = create_mcp_client()
    tools = await client.get_tools()
    tool = next((t for t in tools if t.name == "list_airlines"), None)
    if not tool:
        return "Airline tool unavailable"
    return await tool.ainvoke({})

# LLM
llm = ChatGroq(
    model="openai/gpt-oss-120b"
)

def extract_destination(query: str):
    prompt = f"""
    Extract only the destination city or country.

    Query:
    {query}

    Return only destination name.
    """
    response = llm.invoke(prompt)
    return response.content.strip()