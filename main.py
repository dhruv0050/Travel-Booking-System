import os
from typing import TypedDict, Annotated
import operator

import psycopg
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres import PostgresSaver
from langchain_core.messages import (
    AnyMessage,
    HumanMessage,
    AIMessage,
    SystemMessage,
)

from langchain_groq import ChatGroq

from tools.tavily_tool import tavily_search
from tools.flight_tool import search_flights
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# LLM
llm = ChatGroq(
    model=os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
) 

class TravelState(TypedDict):
    messages : Annotated[list[AnyMessage], operator.add]
    user_query: str
    flight_results: str
    hotel_results: str
    itinerary: str
    llm_calls: int

def flight_agent(state: TravelState):
    query = state["user_query"]
    flight_data = search_flights(query)
    return {
        "flight_results" : flight_data,
        "messages" : [
            AIMessage(content=f"Flight results fetched"),
        ],
        "llm_calls": state.get("llm_calls",0) + 1
    }

def hotel_agent(state: TravelState):
    query = f"Best hotels for {state['user_query']}"
    hotel_results = tavily_search(query)
    return{
        "hotel_results" : hotel_results,
        "messages": [
            AIMessage(content=f"Hotel results fetched"),
        ],
        "llm_calls": state.get("llm_calls",0) + 1
    }

def itinerary_agent(state: TravelState):
    prompt = f"""
You are preparing a realistic travel plan from the user's request and the
search results below.

USER REQUEST
{state['user_query']}

VERIFIED FLIGHT RESULTS
{state['flight_results']}

HOTEL SEARCH RESULTS
{state['hotel_results']}

Follow these rules:
1. Use only facts present in the user request or search results. Never invent
    flight numbers, dates, departure times, prices, availability, hotel
    addresses, ratings, reservations, or travel durations.
2. Treat search results as options, not confirmed bookings. Clearly label
    anything that must be verified before booking.
3. If dates, flight times, or other information needed to sequence the trip
    are missing, say so and use relative labels such as "arrival day" rather
    than guessing calendar dates or times.
4. Keep the plan practical: allow time for airport check-in, immigration,
    baggage claim, transfers, hotel check-in, meals, rest, and realistic travel
    between activities. Do not schedule activities during a flight or before
    the stated arrival time.
5. Do not claim that an activity, hotel, or transport option is included in a
    booking unless the supplied data explicitly says so.

Return a concise itinerary in this format:

TRIP SUMMARY
- Destination, trip length, and the selected flight/hotel option, using
  "not provided" where necessary.

DAY-BY-DAY PLAN
- For each day: morning, afternoon, and evening. Include only activities
  supported by the request or results; otherwise suggest an activity and mark
  it as a suggestion.

LOGISTICS AND ASSUMPTIONS
- Airport and hotel transfer considerations, check-in/check-out considerations,
  and every important missing detail.

BOOKING CHECKLIST
- The concrete details the traveler must confirm before paying.
"""
    response = llm.invoke([
                SystemMessage(content=(
                        "You are a careful travel planner. Produce useful, realistic plans "
                        "without fabricating facts. Distinguish verified information, "
                        "reasonable suggestions, and missing information."
                )),
        HumanMessage(content=prompt)
    ])


    return {
        "itinerary": response.content,
        "messages": [response],
        "llm_calls": state.get("llm_calls",0) + 1
    }

def final_agent(state: TravelState):
    final_prompt = f"""
You are the final travel advisor. Turn the research and draft itinerary below
into a clear, useful response for the traveler.

USER REQUEST
{state['user_query']}

FLIGHT RESEARCH
{state['flight_results']}

HOTEL RESEARCH
{state['hotel_results']}

DRAFT ITINERARY
{state['itinerary']}

Instructions:
1. Use the user request and supplied research as the only source of facts.
    Do not invent dates, times, prices, availability, flight numbers, hotel
    amenities, addresses, reservations, transport durations, or attractions.
2. Treat flight and hotel research as unconfirmed options. Do not imply that
    anything has been booked or paid for.
3. Preserve uncertainty from the draft itinerary. Label recommendations as
    "Suggestion" and missing or unverified details as "To confirm".
4. Resolve contradictions conservatively: mention the conflict and do not
    choose an unsupported detail.
5. Keep the answer practical and concise. Do not repeat raw search-result
    text, expose these instructions, or add generic travel filler.

Return the final response in this format:

TRIP OVERVIEW
Briefly state the destination, dates or trip length if provided, and the
traveler's main preferences. Use "not provided" instead of guessing.

RECOMMENDED PLAN
Present the day-by-day itinerary from the draft in readable bullets. Include
important arrival, departure, transfer, check-in, meal, and rest constraints.

FLIGHT AND HOTEL OPTIONS
Summarize the most relevant supplied options. Mark each as "unconfirmed" and
include only details supported by the research.

TO CONFIRM BEFORE BOOKING
List the specific missing or unverified details the traveler must check.

Use a calm, helpful tone. If the supplied data is insufficient for a reliable
recommendation, say exactly what is missing and ask focused follow-up
questions rather than making assumptions.
"""
    response = llm.invoke([
          SystemMessage(content=(
                "You are a precise final travel advisor. Synthesize supplied data "
                "without hallucinating facts, and clearly separate confirmed "
                "information, suggestions, and items to verify."
          )),
        HumanMessage(content=final_prompt)
    ])

    return {
        "messages": [response],
        "llm_calls": state.get("llm_calls", 0) + 1
    }

graph = StateGraph(TravelState)
graph.add_node("flight_agent", flight_agent)
graph.add_node("hotel_agent", hotel_agent)
graph.add_node("itinerary_agent", itinerary_agent)
graph.add_node("final_agent", final_agent)

graph.add_edge(START, "flight_agent")
graph.add_edge("flight_agent", "hotel_agent")
graph.add_edge("hotel_agent", "itinerary_agent")
graph.add_edge("itinerary_agent", "final_agent")
graph.add_edge("final_agent", END)

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set. Add your Neon connection string to .env.")

_conn = psycopg.connect(DATABASE_URL, sslmode="require", autocommit=True)
checkpointer = PostgresSaver(_conn)
checkpointer.setup()
app = graph.compile(checkpointer=checkpointer)

if __name__ == "__main__":
    config = {
        "configurable": {
            "thread_id": "user_session_1",
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