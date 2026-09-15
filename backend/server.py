import sys
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import asyncio
import json
import uuid
import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from main import build_graph
from langgraph.types import Command


# Build graph once at startup
graph_app = None
sessions = {}  # thread_id -> config


@asynccontextmanager
async def lifespan(app: FastAPI):
    global graph_app
    graph_app = build_graph()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


AGENT_LABELS = {
    "supervisor": "Analyzing your request",
    "flight_agent": "Searching for flights",
    "hotel_agent": "Finding best hotels",
    "budget_agent": "Analyzing budget",
    "itinerary_agent": "Building itinerary",
    "human_approval": "Awaiting your approval",
    "final_response": "Generating final plan",
}

AGENT_ORDER = [
    "supervisor",
    "flight_agent",
    "hotel_agent",
    "budget_agent",
    "itinerary_agent",
    "human_approval",
    "final_response",
]


def sse_event(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


def run_graph_sync(graph, input_data, config):
    """Run graph.stream in a thread and return results via a queue."""
    results = []
    try:
        for event in graph.stream(input_data, config=config, stream_mode="updates"):
            results.append(event)
    except Exception as e:
        results.append({"__error__": str(e)})
    return results


@app.post("/api/plan")
async def plan_trip(request: Request):
    body = await request.json()
    query = body.get("query", "").strip()
    start_date = body.get("start_date", "")
    end_date = body.get("end_date", "")
    duration_days = body.get("duration_days", "")

    if not query:
        return {"error": "Please provide a travel query."}

    full_query = query
    if start_date and end_date:
        full_query = f"{query}\nTrip Schedule: {start_date} to {end_date} ({duration_days} days total. Day 1 / Departure: {start_date}, Final Day / Return: {end_date})."

    thread_id = str(uuid.uuid4())
    config = {"configurable": {"thread_id": thread_id}}
    sessions[thread_id] = config

    async def event_stream():
        yield sse_event({"type": "session", "thread_id": thread_id})

        # Determine which agents will be selected by running the graph
        loop = asyncio.get_event_loop()

        try:
            results = await loop.run_in_executor(
                None,
                run_graph_sync,
                graph_app,
                {"user_query": full_query, "messages": [], "llm_calls": 0},
                config,
            )
        except Exception as e:
            yield sse_event({"type": "error", "message": str(e)})
            yield sse_event({"type": "done"})
            return

        for event in results:
            if "__error__" in event:
                yield sse_event({"type": "error", "message": event["__error__"]})
                continue

            for node_name, node_output in event.items():
                if node_name == "__interrupt__":
                    # Human approval interrupt
                    interrupt_data = (
                        node_output[0]
                        if isinstance(node_output, (list, tuple))
                        else node_output
                    )
                    interrupt_value = interrupt_data.value if hasattr(interrupt_data, 'value') else interrupt_data

                    yield sse_event({
                        "type": "interrupt",
                        "thread_id": thread_id,
                        "data": {
                            "itinerary": interrupt_value.get("draft_itinerary", ""),
                            "question": interrupt_value.get("question", ""),
                            "approval_request": interrupt_value.get("approval_request", ""),
                        },
                    })
                else:
                    yield sse_event({
                        "type": "agent_done",
                        "agent": node_name,
                        "label": AGENT_LABELS.get(node_name, node_name),
                    })

                    # Check for guardrail block (supervisor rejects with final_response)
                    if node_name == "supervisor" and node_output.get("final_response"):
                        yield sse_event({
                            "type": "final",
                            "data": node_output["final_response"],
                        })

                    # Check for final_response node output
                    if node_name == "final_response" and node_output.get("final_response"):
                        yield sse_event({
                            "type": "final",
                            "data": node_output["final_response"],
                        })

        yield sse_event({"type": "done"})

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.post("/api/plan/resume")
async def resume_plan(request: Request):
    body = await request.json()
    thread_id = body.get("thread_id", "")
    approved = body.get("approved", False)
    feedback = body.get("feedback", "")

    config = sessions.get(thread_id)
    if not config:
        return {"error": "Session not found. Please start a new plan."}

    async def event_stream():
        loop = asyncio.get_event_loop()

        try:
            results = await loop.run_in_executor(
                None,
                run_graph_sync,
                graph_app,
                Command(resume={"approved": approved, "feedback": feedback}),
                config,
            )
        except Exception as e:
            yield sse_event({"type": "error", "message": str(e)})
            yield sse_event({"type": "done"})
            return

        for event in results:
            if "__error__" in event:
                yield sse_event({"type": "error", "message": event["__error__"]})
                continue

            for node_name, node_output in event.items():
                if node_name == "__interrupt__":
                    interrupt_data = (
                        node_output[0]
                        if isinstance(node_output, (list, tuple))
                        else node_output
                    )
                    interrupt_value = interrupt_data.value if hasattr(interrupt_data, 'value') else interrupt_data
                    yield sse_event({
                        "type": "interrupt",
                        "thread_id": thread_id,
                        "data": {
                            "itinerary": interrupt_value.get("draft_itinerary", ""),
                            "question": interrupt_value.get("question", ""),
                            "approval_request": interrupt_value.get("approval_request", ""),
                        },
                    })
                else:
                    yield sse_event({
                        "type": "agent_done",
                        "agent": node_name,
                        "label": AGENT_LABELS.get(node_name, node_name),
                    })

                    if node_name == "final_response" and node_output.get("final_response"):
                        yield sse_event({
                            "type": "final",
                            "data": node_output["final_response"],
                        })

        yield sse_event({"type": "done"})

    return StreamingResponse(event_stream(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
