import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePickerModal from "./DatePickerModal";
import "./ChatPage.css";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_124724_bc041163-d651-425f-aea3-2acc1efc2c96.mp4";

function extractDurationDays(text) {
  if (!text) return 5;
  const lower = text.toLowerCase();

  const dayMatch = lower.match(/(\d+)\s*(?:-|–)?\s*days?/);
  if (dayMatch) {
    const d = parseInt(dayMatch[1], 10);
    if (d > 0 && d <= 60) return d;
  }

  const nightMatch = lower.match(/(\d+)\s*(?:-|–)?\s*nights?/);
  if (nightMatch) {
    const n = parseInt(nightMatch[1], 10);
    if (n > 0 && n <= 60) return n + 1;
  }

  if (lower.includes("weekend")) return 3;
  if (lower.includes("two weeks") || lower.includes("2 weeks")) return 14;
  if (lower.includes("one week") || lower.includes("a week") || lower.includes("1 week")) return 7;

  const wordNums = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
    seven: 7, eight: 8, nine: 9, ten: 10
  };
  for (const [w, val] of Object.entries(wordNums)) {
    if (new RegExp(`\\b${w}\\s+(?:days?|nights?)\\b`).test(lower)) {
      return lower.includes("night") ? val + 1 : val;
    }
  }

  return 5;
}

function BrandMark() {
  return (
    <svg
      className="brand-mark"
      viewBox="0 0 34 34"
      width="34"
      height="34"
      aria-hidden="true"
    >
      <circle cx="17" cy="17" r="17" fill="#9C86CE" />
      <circle cx="17" cy="17" r="8.6" fill="#FFFFFF" />
      <circle cx="17" cy="17" r="3.7" fill="#151519" />
    </svg>
  );
}

function SendArrow() {
  return (
    <svg viewBox="0 0 12 14" width="11.66" height="13.6" aria-hidden="true">
      <path
        fill="currentColor"
        d="M5.35 1.05a.9.9 0 0 1 1.3 0l4.4 4.55a.9.9 0 1 1-1.3 1.25L6.9 3.9v8.35a.9.9 0 0 1-1.8 0V3.9L2.25 6.85a.9.9 0 1 1-1.3-1.25L5.35 1.05Z"
      />
    </svg>
  );
}

function PlaneSVG() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className="plane-icon">
      <path
        fill="currentColor"
        d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
      />
    </svg>
  );
}

export default function ChatPage() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [detectedDays, setDetectedDays] = useState(5);
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("anim")) {
      root.classList.add("anim");
    }

    const timeout = setTimeout(() => {
      root.classList.remove("anim");
    }, 2600);

    return () => clearTimeout(timeout);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    const days = extractDurationDays(trimmed);
    setDetectedDays(days);
    setIsDatePickerOpen(true);
  };

  const handleDateConfirm = ({ startDate, endDate, startFormatted, endFormatted, durationDays }) => {
    setIsDatePickerOpen(false);
    navigate("/response", {
      state: {
        query: query.trim(),
        startDate: startFormatted,
        endDate: endFormatted,
        durationDays,
      },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [query]);

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

      <div className="frame">
        <header className="nav">
          <a className="brand" href="/" aria-label="GoVibe home">
            <BrandMark />
            <span className="brand-word">GoVibe</span>
          </a>
        </header>

        <main className="hero">
          <div className="hero-content">
            <PlaneSVG />
            <h1 className="h1">Where do you want to go?</h1>
            <p className="subtitle">
              Your AI travel agent — powered by real-time flight, hotel & budget data
            </p>
          </div>

          <form
            className={`chat-card ${isFocused ? "chat-card--focused" : ""}`}
            onSubmit={handleSubmit}
          >
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder="Plan a 5-day trip to Tokyo with a $2000 budget..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              rows={1}
              id="travel-query-input"
            />
            <div className="chat-actions">
              <span className="hint-text">Press Enter to send</span>
              <button
                type="submit"
                className="send-btn"
                aria-label="Plan my trip"
                disabled={!query.trim()}
                id="send-query-btn"
              >
                <SendArrow />
              </button>
            </div>
          </form>

          <div className="suggestions">
            {[
              "Weekend in Paris for two 🗼",
              "Budget backpacking in Southeast Asia 🎒",
              "Family vacation to Hawaii 🌺",
            ].map((text) => (
              <button
                key={text}
                type="button"
                className="suggestion-chip"
                onClick={() => {
                  setQuery(text.replace(/\s*[\u{1F000}-\u{1FFFF}]\s*/gu, "").trim());
                  textareaRef.current?.focus();
                }}
              >
                {text}
              </button>
            ))}
          </div>
        </main>
      </div>

      <DatePickerModal
        isOpen={isDatePickerOpen}
        initialDays={detectedDays}
        query={query}
        onClose={() => setIsDatePickerOpen(false)}
        onConfirm={handleDateConfirm}
      />
    </div>
  );
}
