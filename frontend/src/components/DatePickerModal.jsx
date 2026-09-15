import { useState, useMemo } from "react";
import "./DatePickerModal.css";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DatePickerModal({ isOpen, initialDays = 5, query = "", onClose, onConfirm }) {
  const [days, setDays] = useState(initialDays);
  
  // Default to tomorrow
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const tomorrow = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d;
  }, [today]);

  const [selectedStart, setSelectedStart] = useState(tomorrow);
  const [viewDate, setViewDate] = useState(() => new Date(tomorrow.getFullYear(), tomorrow.getMonth(), 1));

  // Sync initialDays if prop updates
  useMemo(() => {
    if (initialDays > 0) {
      setDays(initialDays);
    }
  }, [initialDays]);

  if (!isOpen) return null;

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Calculate End Date
  const calculatedEndDate = new Date(selectedStart);
  calculatedEndDate.setDate(selectedStart.getDate() + (days - 1));

  // Generate calendar days for current view
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - 1, daysInPrevMonth - i);
    calendarDays.push({ date, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(currentYear, currentMonth, d);
    calendarDays.push({ date, isCurrentMonth: true });
  }

  // Next month leading days (to fill 42 cells)
  const remainingCells = 42 - calendarDays.length;
  for (let d = 1; d <= remainingCells; d++) {
    const date = new Date(currentYear, currentMonth + 1, d);
    calendarDays.push({ date, isCurrentMonth: false });
  }

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isInRange = (date) => {
    if (!selectedStart || !calculatedEndDate) return false;
    const time = date.getTime();
    return time >= selectedStart.getTime() && time <= calculatedEndDate.getTime();
  };

  const isPast = (date) => {
    return date.getTime() < today.getTime();
  };

  const handleSelectDate = (date) => {
    if (isPast(date)) return;
    setSelectedStart(date);
  };

  const handleConfirm = () => {
    const startStr = selectedStart.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    const endStr = calculatedEndDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    onConfirm({
      startDate: selectedStart,
      endDate: calculatedEndDate,
      startFormatted: startStr,
      endFormatted: endStr,
      durationDays: days
    });
  };

  return (
    <div className="calendar-modal-backdrop" onClick={onClose}>
      <div className="calendar-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="calendar-modal-header">
          <div className="calendar-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Trip Schedule</span>
          </div>
          <button className="calendar-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        <div className="calendar-modal-title-row">
          <div>
            <h2 className="calendar-modal-title">Select Trip Start Date</h2>
            <p className="calendar-modal-sub">
              Your agents will build realistic day-by-day bookings around this schedule
            </p>
          </div>
          <div className="days-counter-pill">
            <span className="days-counter-label">Duration</span>
            <div className="days-counter-controls">
              <button
                type="button"
                className="days-counter-btn"
                onClick={() => setDays(Math.max(1, days - 1))}
                disabled={days <= 1}
              >
                -
              </button>
              <span className="days-counter-val">{days} {days === 1 ? "Day" : "Days"}</span>
              <button
                type="button"
                className="days-counter-btn"
                onClick={() => setDays(Math.min(30, days + 1))}
                disabled={days >= 30}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="calendar-month-nav">
          <button
            type="button"
            className="calendar-nav-btn"
            onClick={handlePrevMonth}
            aria-label="Previous month"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="calendar-month-label">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </div>
          <button
            type="button"
            className="calendar-nav-btn"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Days of week */}
        <div className="calendar-grid-weekdays">
          {DAYS_OF_WEEK.map((dw) => (
            <div key={dw} className="calendar-weekday-cell">
              {dw}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid">
          {calendarDays.map(({ date, isCurrentMonth }, idx) => {
            const past = isPast(date);
            const isStart = isSameDay(date, selectedStart);
            const isEnd = isSameDay(date, calculatedEndDate);
            const inRange = isInRange(date);

            let dayClasses = "calendar-day-btn";
            if (!isCurrentMonth) dayClasses += " other-month";
            if (past) dayClasses += " past-day";
            if (inRange) dayClasses += " in-range";
            if (isStart) dayClasses += " range-start";
            if (isEnd) dayClasses += " range-end";

            return (
              <button
                key={idx}
                type="button"
                className={dayClasses}
                onClick={() => handleSelectDate(date)}
                disabled={past}
              >
                <span className="calendar-day-num">{date.getDate()}</span>
                {isStart && <span className="calendar-marker-label">Start</span>}
                {isEnd && !isStart && <span className="calendar-marker-label">End</span>}
              </button>
            );
          })}
        </div>

        {/* Date Summary Card */}
        <div className="calendar-summary-strip">
          <div className="summary-date-col">
            <span className="summary-label">Departure</span>
            <span className="summary-val">
              {selectedStart.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" })}
            </span>
          </div>
          <div className="summary-arrow-col">
            <span className="summary-duration-tag">{days} {days === 1 ? "Day" : "Days"}</span>
            <svg width="24" height="14" viewBox="0 0 24 14" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="2" y1="7" x2="22" y2="7" />
              <polyline points="16 2 22 7 16 12" />
            </svg>
          </div>
          <div className="summary-date-col">
            <span className="summary-label">Return</span>
            <span className="summary-val">
              {calculatedEndDate.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" })}
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="calendar-modal-actions">
          <button type="button" className="calendar-cancel-btn" onClick={onClose}>
            Back
          </button>
          <button type="button" className="calendar-confirm-btn" onClick={handleConfirm}>
            <span>Start Planning with Dates</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
