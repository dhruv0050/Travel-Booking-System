import { useEffect } from "react";
import "./Landing.css";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_124724_bc041163-d651-425f-aea3-2acc1efc2c96.mp4";

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

function IconScreens() {
  return (
    <svg viewBox="0 0 16 14" width="15.06" height="13.18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M1.4 1.1h8.8c.77 0 1.4.63 1.4 1.4v5.9c0 .77-.63 1.4-1.4 1.4H7.05l.55 1.9h1.85a.55.55 0 0 1 0 1.1H2.95a.55.55 0 0 1 0-1.1h1.85l.55-1.9H1.4C.63 9.8 0 9.17 0 8.4V2.5c0-.77.63-1.4 1.4-1.4Zm10.55 2.35h2.65c.77 0 1.4.63 1.4 1.4v5.55c0 .77-.63 1.4-1.4 1.4h-1.55l.35 1.2h.95a.45.45 0 0 1 0 .9H9.95a.45.45 0 0 1 0-.9h.95l.35-1.2h-.4V5.2c0-.96.78-1.75 1.75-1.75Z"
      />
    </svg>
  );
}

function IconFigma() {
  return (
    <svg viewBox="0 0 12 16" width="11.8" height="15.73" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 0h4a2.9 2.9 0 0 1 0 5.8H4V0Zm0 5.8h4a2.9 2.9 0 1 1 0 5.8H4V5.8ZM1.1 0H4v5.8H1.1A2.9 2.9 0 0 1 1.1 0Zm0 5.8H4v5.8H1.1a2.9 2.9 0 0 1 0-5.8ZM4 11.6a2.9 2.9 0 1 1 2.9 2.9A2.9 2.9 0 0 1 4 11.6Z"
      />
    </svg>
  );
}

function IconTheme() {
  return (
    <svg viewBox="0 0 14 14" width="12.13" height="12.13" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 0a7 7 0 1 0 0 14A7 7 0 0 0 7 0Zm0 1.35a5.65 5.65 0 0 1 0 11.3V1.35Z"
      />
    </svg>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 8 5" width="6.8" height="4.25" aria-hidden="true">
      <path
        fill="currentColor"
        d="M0.6 0.4a.7.7 0 0 1 .99 0L4 2.8 6.41.4a.7.7 0 1 1 .99.99L4.5 4.3a.7.7 0 0 1-.99 0L.6 1.39A.7.7 0 0 1 .6.4Z"
      />
    </svg>
  );
}

function Paperclip() {
  return (
    <svg viewBox="0 0 20 20" width="19.79" height="19.79" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14.35 4.12a2.9 2.9 0 0 0-4.1 0L4.48 9.9a4.35 4.35 0 1 0 6.15 6.15l5.18-5.18a.85.85 0 1 0-1.2-1.2l-5.18 5.18a2.65 2.65 0 1 1-3.75-3.75l5.77-5.78a1.2 1.2 0 1 1 1.7 1.7l-5.3 5.3a.85.85 0 0 0 1.2 1.2l5.3-5.3a2.9 2.9 0 0 0 0-4.1Z"
      />
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

function LogoGoogle() {
  return (
    <svg
      className="logo-google"
      viewBox="0 0 97 32"
      width="96.84"
      height="32"
      aria-label="Google"
    >
      <path
        fill="currentColor"
        d="M12.2 15.95c0 3.55-2.8 6.2-6.1 6.2S0 19.5 0 15.95 2.8 9.75 6.1 9.75s6.1 2.65 6.1 6.2Zm-2.15 0c0-2.4-1.7-4-3.95-4s-3.95 1.6-3.95 4 1.7 4 3.95 4 3.95-1.6 3.95-4Zm9.2 5.95c-2.85 0-5.15-2.15-5.15-6.05 0-3.85 2.35-6.1 5.2-6.1 1.75 0 2.85.7 3.55 1.55l-.9 1.05c-.55-.65-1.35-1.15-2.6-1.15-1.95 0-3.3 1.6-3.3 4.6 0 2.95 1.3 4.6 3.3 4.6 1.25 0 2.05-.5 2.7-1.2v-1.75h-2.85v-1.4h4.7v3.85c-.9 1.15-2.25 2-4.65 2Zm11.55.25h-2l-4.85-12h2.2l3.55 8.85 3.55-8.85h2.2l-4.85 12Zm6.05-1.65v-3.55h5.35v1.45h-3.35v.85c0 1.85.7 2.55 2.1 2.55.7 0 1.35-.15 1.8-.4v1.5c-.55.3-1.35.5-2.3.5-2.4 0-3.6-1.45-3.6-3.9Zm9.95 1.65h-1.95V9.15h1.95v12.35Zm4.55 0h-1.95V9.15h1.95v12.35Zm9.4.25c-2.95 0-5.15-2.2-5.15-6.1 0-3.85 2.25-6.05 5.15-6.05s5.15 2.2 5.15 6.05c0 3.9-2.25 6.1-5.15 6.1Zm0-1.5c1.85 0 3.15-1.55 3.15-4.6s-1.3-4.55-3.15-4.55-3.15 1.5-3.15 4.55 1.3 4.6 3.15 4.6Zm12.35 1.5c-2.6 0-4.35-1.75-4.35-4.25 0-2.65 2-4.35 4.75-4.35 1.7 0 2.85.55 3.55 1.45l-.95 1.1c-.5-.65-1.3-1.05-2.5-1.05-1.55 0-2.75.95-2.75 2.7h6.35v.55c0 3.15-1.85 4.85-4.1 4.85Zm.15-1.45c1.25 0 2.15-.8 2.2-2.25h-4.4c.1 1.35.95 2.25 2.2 2.25Zm10.2 1.45c-1.55 0-2.65-.7-3.2-1.55l1.15-1c.4.65 1.1 1.1 2.1 1.1 1.05 0 1.7-.5 1.7-1.25 0-.7-.45-1.05-1.9-1.45l-1.05-.3c-1.85-.5-2.7-1.4-2.7-2.95 0-1.85 1.5-3.15 3.55-3.15 1.4 0 2.45.5 3.1 1.4l-1.1 1c-.45-.6-1.1-.95-2-.95-.95 0-1.55.5-1.55 1.15 0 .7.45 1.05 1.85 1.45l1.05.3c2 .55 2.8 1.45 2.8 3 0 1.95-1.55 3.25-3.85 3.25Z"
      />
    </svg>
  );
}

function LogoCisco() {
  return (
    <svg
      className="logo-cisco"
      viewBox="0 0 68 32"
      width="67.29"
      height="32"
      aria-label="Cisco"
    >
      <path
        fill="currentColor"
        d="M4.2 11.2h2.05v9.6H4.2v-9.6Zm5.55 0h1.95v1.35h.05c.4-.95 1.2-1.55 2.35-1.55 1.7 0 2.75 1.1 2.75 3.05v6.75h-2v-6.3c0-1.15-.55-1.8-1.55-1.8-1.1 0-1.8.8-1.8 2.05v6.05h-2V11.2h.25Zm10.35 5.05c0-3.15 1.95-5.25 4.7-5.25s4.7 2.1 4.7 5.25-1.95 5.25-4.7 5.25-4.7-2.1-4.7-5.25Zm2.05 0c0 2.05 1.05 3.45 2.65 3.45s2.65-1.4 2.65-3.45-1.05-3.45-2.65-3.45-2.65 1.4-2.65 3.45Zm9.35-5.05h1.95v1.4h.05c.45-.95 1.25-1.6 2.5-1.6 2.05 0 3.25 1.35 3.25 3.55v6.25h-2v-5.85c0-1.3-.65-2.05-1.8-2.05-1.2 0-2 1-2 2.3v5.6h-2V11.2h.05Zm12.2 10.05c-2.9 0-4.85-2.05-4.85-5.2s2-5.3 4.95-5.3c1.85 0 3.15.75 3.9 1.95l-1.35 1.05c-.5-.8-1.3-1.35-2.5-1.35-1.7 0-2.9 1.3-2.9 3.55s1.15 3.5 2.9 3.5c1.25 0 2.1-.55 2.6-1.4l1.4 1c-.8 1.3-2.2 2.2-4.15 2.2Zm8.35-.45h-1.95l-3.35-9.6h2.15l2.2 6.85 2.2-6.85h2.1l-3.35 9.6Z"
      />
    </svg>
  );
}

function LogoAdobe() {
  return (
    <svg
      className="logo-adobe"
      viewBox="0 0 89 32"
      width="88.68"
      height="32"
      aria-label="Adobe"
    >
      <path
        fill="currentColor"
        d="M8.9 21.8 4.55 10.2h2.3l2.85 8.15L12.6 10.2h2.25L10.5 21.8H8.9Zm9.35 0V10.2h5.85c2.55 0 4.1 1.5 4.1 3.65 0 1.65-.9 2.9-2.35 3.4l2.85 4.55h-2.45l-2.55-4.2h-3.05v4.2h-2.4Zm2.4-6h3.2c1.3 0 2.05-.7 2.05-1.75s-.75-1.7-2.05-1.7h-3.2v3.45Zm14.2 6.25c-3.15 0-5.35-2.25-5.35-5.95s2.25-5.95 5.4-5.95c1.95 0 3.35.8 4.2 2.05l-1.55 1.15c-.6-.9-1.5-1.5-2.7-1.5-1.85 0-3.15 1.5-3.15 4.2s1.3 4.25 3.15 4.25c1.25 0 2.15-.6 2.75-1.55l1.55 1.1c-.85 1.3-2.3 2.2-4.3 2.2Zm10.85-.25h-2.35l-4.05-11.6h2.5l2.75 8.5 2.75-8.5h2.45l-4.05 11.6Zm8.05 0h-2.4V10.2h2.4v11.6Zm4.55 0V10.2h2.25l4.55 7.35V10.2h2.25v11.6h-2.25l-4.55-7.35v7.35h-2.25Z"
      />
    </svg>
  );
}

export default function Landing() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("anim")) return;

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      root.classList.remove("anim");
    };

    const timeout = window.setTimeout(finish, 2600);

    const logos = root.querySelectorAll(".logos svg");
    const last = logos[logos.length - 1];
    const onEnd = (e) => {
      if (e.animationName === "e-settle-up") finish();
    };
    if (last) last.addEventListener("animationend", onEnd);

    return () => {
      window.clearTimeout(timeout);
      if (last) last.removeEventListener("animationend", onEnd);
    };
  }, []);

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
        <input type="checkbox" id="menu" />

        <header className="nav">
          <a className="brand" href="#" aria-label="Fastshot home">
            <BrandMark />
            <span className="brand-word">GoVibe</span>
          </a>

          <nav className="links" aria-label="Primary">
            <a href="#">Features</a>
            <a href="#">Examples</a>
            <a href="#">Pricing</a>
            <a href="#">Docs</a>
          </nav>

          <a className="cta" href="#">
            <span>Get Started</span>
          </a>

          <label className="burger" htmlFor="menu" aria-label="Open menu">
            <span className="burger-bars" aria-hidden="true">
              <span />
              <span />
            </span>
          </label>
        </header>

        <div className="sheet">
          <div className="sheet-inner">
            <div className="sheet-panel">
              <a href="#">Features</a>
              <a href="#">Examples</a>
              <a href="#">Pricing</a>
              <a href="#">Docs</a>
              <a className="cta" href="#">
                <span>Get Started</span>
              </a>
            </div>
          </div>
        </div>

        <main className="hero">
          <h1 className="h1">Describe an app. We&apos;ll build it.</h1>

          <form
            className="card"
            onSubmit={(e) => {
              e.preventDefault();
              return false;
            }}
          >
            <p className="ph">
              Build a fintech tracking app with bank level privacy and...
            </p>

            <div className="tools">
              <div className="chips">
                <button
                  type="button"
                  className="chip"
                  style={{ "--cw": 107, "--pl": 12, "--ig": 3.7 }}
                >
                  <IconScreens />
                  <span>Attach Screens</span>
                </button>
                <button
                  type="button"
                  className="chip"
                  style={{ "--cw": 108, "--pl": 16, "--ig": 3.9 }}
                >
                  <IconFigma />
                  <span>Attach a Figma</span>
                </button>
                <button
                  type="button"
                  className="chip"
                  style={{ "--cw": 107, "--pl": 15.8, "--ig": 2.9 }}
                >
                  <IconTheme />
                  <span>Today&apos;s Theme</span>
                </button>
              </div>

              <div className="right">
                <button type="button" className="model">
                  Sonnet 4.5
                  <Chevron />
                </button>
                <button type="button" className="attach" aria-label="Attach">
                  <Paperclip />
                </button>
                <button type="button" className="send" aria-label="Build it">
                  <SendArrow />
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
