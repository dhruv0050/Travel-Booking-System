import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "./ResponsePage.css";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_124724_bc041163-d651-425f-aea3-2acc1efc2c96.mp4";

const API_BASE = "http://localhost:8000";

const AGENTS = [
  { key: "supervisor", label: "Analyzing your request" },
  { key: "flight_agent", label: "Searching for flights" },
  { key: "hotel_agent", label: "Finding best hotels" },
  { key: "budget_agent", label: "Analyzing budget" },
  { key: "itinerary_agent", label: "Building itinerary" },
];

function cleanMarkdown(text) {
  if (!text) return "";
  return text.replace(/<br\s*\/?>/gi, "<br />");
}

/* ── SVG Icon Components ── */

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 34 34" width="34" height="34" aria-hidden="true">
      <circle cx="17" cy="17" r="17" fill="#9C86CE" />
      <circle cx="17" cy="17" r="8.6" fill="#FFFFFF" />
      <circle cx="17" cy="17" r="3.7" fill="#151519" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="spinner" viewBox="0 0 24 24" width="18" height="18">
      <circle
        cx="12" cy="12" r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="31.4 31.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" className="check-icon">
      <path
        fill="currentColor"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      />
    </svg>
  );
}

/* Step icons — clean SVGs, no emojis */
function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a5 5 0 0 1 4.546 2.914A4 4 0 0 1 18 11a4.002 4.002 0 0 1-1.382 3.025A5 5 0 0 1 12 22a5 5 0 0 1-4.618-7.975A4.002 4.002 0 0 1 6 11a4 4 0 0 1 1.454-6.086A5 5 0 0 1 12 2z" />
      <path d="M12 2v20" opacity=".4" />
      <path d="M8 8.5h8M8 15.5h8" opacity=".4" />
    </svg>
  );
}

function FlightIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
  );
}

function HotelIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M16 14h2" />
      <path d="M22 6V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v1" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </svg>
  );
}

function ClipboardCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 7h6" />
      <path d="M9 3v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V3" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <ellipse cx="12" cy="12" rx="4" ry="10" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22l-4-9-9-4 20-7z" />
    </svg>
  );
}

const AGENT_ICONS = {
  supervisor: BrainIcon,
  flight_agent: FlightIcon,
  hotel_agent: HotelIcon,
  budget_agent: WalletIcon,
  itinerary_agent: CalendarIcon,
};

/* ── Custom Markdown Components ── */
const markdownComponents = {
  table: ({ children }) => (
    <div className="md-table-wrap">
      <table className="md-table">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="md-thead">{children}</thead>,
  tbody: ({ children }) => <tbody className="md-tbody">{children}</tbody>,
  tr: ({ children }) => <tr className="md-tr">{children}</tr>,
  th: ({ children }) => <th className="md-th">{children}</th>,
  td: ({ children }) => <td className="md-td">{children}</td>,
  h1: ({ children }) => <h2 className="md-h1">{children}</h2>,
  h2: ({ children }) => <h3 className="md-h2">{children}</h3>,
  h3: ({ children }) => <h4 className="md-h3">{children}</h4>,
  h4: ({ children }) => <h5 className="md-h4">{children}</h5>,
  ul: ({ children }) => <ul className="md-ul">{children}</ul>,
  ol: ({ children }) => <ol className="md-ol">{children}</ol>,
  li: ({ children }) => <li className="md-li">{children}</li>,
  p: ({ children }) => <p className="md-p">{children}</p>,
  strong: ({ children }) => <strong className="md-strong">{children}</strong>,
  hr: () => <hr className="md-hr" />,
  blockquote: ({ children }) => <blockquote className="md-blockquote">{children}</blockquote>,
  code: ({ children, className }) => {
    // Inline code (no className means inline, not a fenced block)
    if (!className) {
      return <code className="md-code-inline">{children}</code>;
    }
    return <code className={`md-code-block ${className}`}>{children}</code>;
  },
};

export default function ResponsePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = location.state?.query || "";
  const startDate = location.state?.startDate || "";
  const endDate = location.state?.endDate || "";
  const durationDays = location.state?.durationDays || 5;

  const [agentStatus, setAgentStatus] = useState({});
  const [activeAgent, setActiveAgent] = useState(null);
  const [interruptData, setInterruptData] = useState(null);
  const [finalResponse, setFinalResponse] = useState(null);
  const [threadId, setThreadId] = useState(null);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [phase, setPhase] = useState("loading"); // loading | approval | final | error
  const [prevPhase, setPrevPhase] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const responseCardRef = useRef(null);

  // Redirect if no query
  useEffect(() => {
    if (!query) {
      navigate("/", { replace: true });
    }
  }, [query, navigate]);

  // Smooth phase transition helper
  const transitionToPhase = (newPhase) => {
    setTransitioning(true);
    setPrevPhase(phase);
    // Brief delay to allow exit animation
    setTimeout(() => {
      setPhase(newPhase);
      setTransitioning(false);
    }, 300);
  };

  // Start SSE connection
  useEffect(() => {
    if (!query) return;

    // Mark first agent as active
    setActiveAgent("supervisor");

    const startPlan = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/plan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            start_date: startDate,
            end_date: endDate,
            duration_days: durationDays,
          }),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const event = JSON.parse(jsonStr);

              switch (event.type) {
                case "session":
                  setThreadId(event.thread_id);
                  break;

                case "agent_done":
                  setAgentStatus((prev) => ({ ...prev, [event.agent]: "done" }));
                  {
                    const idx = AGENTS.findIndex((a) => a.key === event.agent);
                    if (idx < AGENTS.length - 1) {
                      const nextKey = AGENTS[idx + 1].key;
                      setActiveAgent(nextKey);
                    }
                  }
                  break;

                case "interrupt":
                  setInterruptData(event.data);
                  transitionToPhase("approval");
                  setActiveAgent(null);
                  break;

                case "final":
                  setFinalResponse(event.data);
                  transitionToPhase("final");
                  setActiveAgent(null);
                  setAgentStatus((prev) => {
                    const all = {};
                    AGENTS.forEach((a) => (all[a.key] = "done"));
                    return { ...prev, ...all };
                  });
                  break;

                case "error":
                  setError(event.message);
                  transitionToPhase("error");
                  setActiveAgent(null);
                  break;

                case "done":
                  break;
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      } catch (err) {
        setError(err.message || "Connection failed. Is the backend running?");
        transitionToPhase("error");
      }
    };

    startPlan();
  }, [query]);

  // Scroll final response into view
  useEffect(() => {
    if (phase === "final" && responseCardRef.current) {
      setTimeout(() => {
        responseCardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
    }
  }, [phase]);

  const handleApprove = async () => {
    transitionToPhase("loading");
    setActiveAgent("final_response");

    try {
      const response = await fetch(`${API_BASE}/api/plan/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thread_id: threadId,
          approved: true,
          feedback: "",
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6).trim());
            if (event.type === "final") {
              setFinalResponse(event.data);
              transitionToPhase("final");
              setActiveAgent(null);
              setAgentStatus((prev) => {
                const all = {};
                AGENTS.forEach((a) => (all[a.key] = "done"));
                return { ...prev, ...all };
              });
            }
            if (event.type === "agent_done") {
              setAgentStatus((prev) => ({ ...prev, [event.agent]: "done" }));
            }
            if (event.type === "error") {
              setError(event.message);
              transitionToPhase("error");
            }
          } catch {}
        }
      }
    } catch (err) {
      setError(err.message);
      transitionToPhase("error");
    }
  };

  const handleRevise = async () => {
    if (!feedback.trim()) return;
    transitionToPhase("loading");
    setActiveAgent("itinerary_agent");
    setInterruptData(null);

    setAgentStatus((prev) => ({
      ...prev,
      itinerary_agent: undefined,
    }));

    try {
      const response = await fetch(`${API_BASE}/api/plan/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thread_id: threadId,
          approved: false,
          feedback: feedback.trim(),
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6).trim());
            if (event.type === "interrupt") {
              setInterruptData(event.data);
              transitionToPhase("approval");
              setActiveAgent(null);
              setFeedback("");
            }
            if (event.type === "final") {
              setFinalResponse(event.data);
              transitionToPhase("final");
              setActiveAgent(null);
              setAgentStatus((prev) => {
                const all = {};
                AGENTS.forEach((a) => (all[a.key] = "done"));
                return { ...prev, ...all };
              });
            }
            if (event.type === "agent_done") {
              setAgentStatus((prev) => ({ ...prev, [event.agent]: "done" }));
            }
            if (event.type === "error") {
              setError(event.message);
              transitionToPhase("error");
            }
          } catch {}
        }
      }
    } catch (err) {
      setError(err.message);
      transitionToPhase("error");
    }
  };

  return (
    <div className="stage">
      <video
        className="stage-video"
        src={VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
      <div className="blur-overlay" />

      <div className="response-frame">
        <header className="nav">
          <a className="brand" href="/" aria-label="GoVibe home">
            <BrandMark />
            <span className="brand-word">GoVibe</span>
          </a>
        </header>

        <main className="response-main">
          {/* User query recap */}
          <div className="query-recap">
            <div className="query-recap-header">
              <span className="query-label">Your trip request</span>
              {startDate && endDate && (
                <div className="trip-schedule-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{startDate} – {endDate} ({durationDays} Days)</span>
                </div>
              )}
            </div>
            <p className="query-text">{query}</p>
          </div>

          {/* Progress Stepper */}
          <div className="stepper">
            {AGENTS.map((agent, i) => {
              const status = agentStatus[agent.key];
              const isActive = activeAgent === agent.key;
              const isDone = status === "done";
              const isPending = !isDone && !isActive;
              const IconComponent = AGENT_ICONS[agent.key];

              return (
                <div
                  key={agent.key}
                  className={`step ${isDone ? "step--done" : ""} ${isActive ? "step--active" : ""} ${isPending ? "step--pending" : ""}`}
                >
                  <div className="step-indicator">
                    {isDone && <CheckIcon />}
                    {isActive && <Spinner />}
                    {isPending && <span className="step-dot" />}
                    {i < AGENTS.length - 1 && <div className={`step-line ${isDone ? "step-line--done" : ""}`} />}
                  </div>
                  <div className="step-content">
                    <span className="step-icon">
                      <IconComponent />
                    </span>
                    <span className="step-label">{agent.label}</span>
                    {isActive && <span className="step-ellipsis" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Generating final plan indicator */}
          {activeAgent === "final_response" && (
            <div className="generating-card">
              <Spinner />
              <span>Generating your final travel plan...</span>
            </div>
          )}

          {/* Approval Card */}
          <div
            className={`phase-container ${phase === "approval" && interruptData ? "phase-visible" : "phase-hidden"} ${transitioning && prevPhase === "approval" ? "phase-exiting" : ""}`}
          >
            {interruptData && (
              <div className="approval-card" id="approval-section">
                <div className="approval-header">
                  <span className="approval-icon-wrap">
                    <ClipboardCheckIcon />
                  </span>
                  <div>
                    <h2 className="approval-title">Review Your Itinerary</h2>
                    <p className="approval-subtitle">Review the draft plan below and approve or request changes</p>
                  </div>
                </div>

                <div className="approval-body">
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={markdownComponents}
                  >
                    {cleanMarkdown(interruptData.itinerary || interruptData.approval_request || "")}
                  </Markdown>
                </div>

                <div className="approval-actions">
                  <div className="revise-group">
                    <input
                      type="text"
                      className="revise-input"
                      placeholder="Suggest changes..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRevise();
                      }}
                      id="revise-feedback-input"
                    />
                    <button
                      className="btn btn--revise"
                      onClick={handleRevise}
                      disabled={!feedback.trim()}
                      id="revise-btn"
                    >
                      <SendIcon />
                      Revise
                    </button>
                  </div>
                  <button className="btn btn--approve" onClick={handleApprove} id="approve-btn">
                    <CheckIcon />
                    Approve Plan
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Final Response */}
          <div
            className={`phase-container ${phase === "final" && finalResponse ? "phase-visible" : "phase-hidden"} ${transitioning && prevPhase === "final" ? "phase-exiting" : ""}`}
          >
            {finalResponse && (
              <div className="final-card" ref={responseCardRef} id="final-response-section">
                <div className="final-header">
                  <span className="final-icon-wrap">
                    <GlobeIcon />
                  </span>
                  <div>
                    <h2 className="final-title">Your Travel Plan</h2>
                    <p className="final-subtitle">Here is your complete, finalized itinerary</p>
                  </div>
                </div>

                <div className="final-body">
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={markdownComponents}
                  >
                    {cleanMarkdown(finalResponse)}
                  </Markdown>
                </div>

                <div className="final-actions">
                  <button className="btn btn--new" onClick={() => navigate("/")} id="new-trip-btn">
                    <PlusIcon />
                    Plan Another Trip
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          <div
            className={`phase-container ${phase === "error" ? "phase-visible" : "phase-hidden"}`}
          >
            <div className="error-card" id="error-section">
              <span className="error-icon-wrap">
                <AlertTriangleIcon />
              </span>
              <p className="error-text">{error}</p>
              <button className="btn btn--new" onClick={() => navigate("/")} id="retry-btn">
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
