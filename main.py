#pip install aviationstack-mcp
import os
import sys
from typing import TypedDict, Annotated
import operator
import asyncio
import psycopg
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres import PostgresSaver
from langchain_core.messages import (
    AnyMessage,
    HumanMessage,
    AIMessage,
    SystemMessage,
)

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from langchain_groq import ChatGroq

from mcp_client import (
    tavily_mcp_search,
    get_airports,
    get_airlines,
    aviation_mcp_call,
    extract_destination,
    get_flight_info,
)


from dotenv import load_dotenv
load_dotenv(override=True)
DATABASE_URL = os.getenv("DATABASE_URL")

# LLM
llm = ChatGroq(
    model="openai/gpt-oss-120b"
)

# State
class TravelState(TypedDict):
    messages: Annotated[list[AnyMessage], operator.add]
    user_query: str
    flight_results: str
    hotel_results: str
    itinerary: str
    llm_calls: int
    weather_results: str

# Flight Tool Router Prompt
FLIGHT_AGENT_PROMPT = """
You are a travel flight expert.

User Query:
{query}

Airport Information:
{airport_data}

Airline Information:
{airline_data}

Generate:

1. Likely departure airport
2. Likely arrival airport
3. Airlines serving this route
4. Typical flight duration
5. Estimated airfare range
6. Peak season pricing warning
7. Booking advice

Return concise travel guidance.
"""

# Flight Agent
def flight_agent(state: TravelState):
    print("\nINSIDE FLIGHT AGENT\n")

    query = state["user_query"]

    try:

        airports, airlines = asyncio.run(get_flight_info())

        prompt = FLIGHT_AGENT_PROMPT.format(
            query=query,
            airport_data=str(airports)[:1000],
            airline_data=str(airlines)[:1000]
        )

        response = llm.invoke([
            SystemMessage(
                content="You are an expert travel flight planner."
            ),
            HumanMessage(content=prompt)
        ])

        flight_data = response.content

    except Exception as e:

        flight_data = f"Flight information unavailable: {str(e)}"

    return {
        "flight_results": flight_data,
        "messages": [
            AIMessage(
                content="Flight recommendations generated"
            )
        ],
        "llm_calls": state.get("llm_calls", 0) + 1
    }




# Hotel Agent
def hotel_agent(state: TravelState):
    query = f"Best hotels for {state['user_query']}"

    hotel_results = asyncio.run(
        tavily_mcp_search(query)
    )

    return {
        "hotel_results": str(hotel_results),
        "messages": [
            AIMessage(content="Hotel information fetched")
        ],
        "llm_calls": state.get("llm_calls", 0) + 1
    }


# Itinerary Agent
def itinerary_agent(state: TravelState):

    flight_info = str(state.get("flight_results", ""))[:1200]
    hotel_info = str(state.get("hotel_results", ""))[:1200]

    prompt = f"""
    Create a detailed travel itinerary based on the following query and research.

    User Query:
    {state['user_query']}

    Flight Information:
    {flight_info}

    Hotel Information:
    {hotel_info}
    """

    response = llm.invoke([
        SystemMessage(
            content="You are an expert travel planner."
        ),
        HumanMessage(content=prompt)
    ])

    return {
        "itinerary": response.content,
        "messages": [response],
        "llm_calls": state.get("llm_calls", 0) + 1
    }



graph = StateGraph(TravelState)

graph.add_node("flight_agent", flight_agent)
graph.add_node("hotel_agent", hotel_agent)
graph.add_node("itinerary_agent", itinerary_agent)


graph.add_edge(START, "flight_agent")
graph.add_edge("flight_agent", "hotel_agent")
graph.add_edge("hotel_agent", "itinerary_agent")
graph.add_edge("itinerary_agent", END)


_conn = psycopg.connect(DATABASE_URL)
checkpointer = PostgresSaver(_conn)
checkpointer.setup()

app = graph.compile(checkpointer=checkpointer)


if __name__ == "__main__":
    import uuid
    config = {
        "configurable": {
            "thread_id": str(uuid.uuid4())
        }
    }


    user_input = input("Enter travel request: ")

    result = app.invoke(
        {
            "messages": [
                HumanMessage(content=user_input)
            ],
            "user_query": user_input,
            "flight_results": "",
            "hotel_results": "",
            "itinerary": "",
            "llm_calls": 0
        },
        config=config
    )

    print("\nFINAL RESPONSE:\n")

    for msg in result["messages"]:
        print(msg.content)