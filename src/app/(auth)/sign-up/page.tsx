"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const username = form.get("username") as string;
    const email    = form.get("email")    as string;
    const password = form.get("password") as string;
    const confirm  = form.get("confirm")  as string;

    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    // 1. Register the user
    const res = await fetch("/api/auth/sign-up", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    // 2. Auto sign-in after successful registration
    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (signInRes?.error) {
      setError("Account created but sign-in failed. Please sign in manually.");
      router.push("/sign-in");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="page">
      <div className="card">

        {/* Logo / brand mark */}
        <div className="brand">
          <div className="brand-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 10C3 6.13 6.13 3 10 3s7 3.13 7 7-3.13 7-7 7-7-3.13-7-7Z" fill="currentColor" opacity=".15"/>
              <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 3.34A7 7 0 1 0 16.66 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="brand-name">LinkVault</span>
        </div>

        <h1 className="heading">Create your account</h1>
        <p className="subheading">Start shortening links and tracking clicks.</p>

        {/* Google OAuth */}
        <button
          type="button"
          className="google-btn"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="divider" role="separator">
          <span>or</span>
        </div>

        {/* Sign-up form */}
        <form onSubmit={handleSubmit} noValidate>

          <div className="field">
            <label htmlFor="username" className="field-label">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Jon Doe"
              className="field-input"
              autoComplete="username"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="email" className="field-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="jondoe@example.com"
              className="field-input"
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password" className="field-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              className="field-input"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>

          <div className="field">
            <label htmlFor="confirm" className="field-label">Confirm password</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              placeholder="Repeat your password"
              className="field-input"
              autoComplete="new-password"
              required
            />
          </div>

          {error && (
            <div className="error" role="alert">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <path d="M7.5 1a6.5 6.5 0 1 0 0 13A6.5 6.5 0 0 0 7.5 1ZM7.5 4.5v4M7.5 10.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="footer-text">
          Already have an account?{" "}
          <Link href="/sign-in" className="link">Sign in</Link>
        </p>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0a;
          padding: 24px 16px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .card {
          width: 100%;
          max-width: 400px;
          background: #111;
          border: 1px solid #222;
          border-radius: 16px;
          padding: 36px 32px 32px;
        }

        /* Brand */
        .brand {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 28px;
        }
        .brand-icon {
          width: 32px;
          height: 32px;
          background: #1a1a2e;
          border: 1px solid #2a2a4a;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #818cf8;
        }
        .brand-name {
          font-size: 15px;
          font-weight: 600;
          color: #f4f4f5;
          letter-spacing: -0.01em;
        }

        /* Headings */
        .heading {
          font-size: 22px;
          font-weight: 600;
          color: #f4f4f5;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }
        .subheading {
          font-size: 14px;
          color: #71717a;
          margin-bottom: 24px;
        }

        /* Google button */
        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 10px 16px;
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 10px;
          color: #d4d4d8;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .google-btn:hover {
          background: #1f1f23;
          border-color: #3f3f46;
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
          color: #3f3f46;
          font-size: 12px;
        }
        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #27272a;
        }
        .divider span { color: #52525b; }

        /* Fields */
        .field { margin-bottom: 14px; }
        .field-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #a1a1aa;
          margin-bottom: 6px;
        }
        .field-input {
          width: 100%;
          padding: 10px 13px;
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 10px;
          color: #f4f4f5;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
        }
        .field-input::placeholder { color: #52525b; }
        .field-input:focus { border-color: #818cf8; }

        /* Error */
        .error {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 12px;
          background: #1f0a0a;
          border: 1px solid #3f1515;
          border-radius: 8px;
          color: #f87171;
          font-size: 13px;
          margin-bottom: 14px;
        }

        /* Submit */
        .submit-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 16px;
          margin-top: 6px;
          background: #818cf8;
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, opacity 0.15s;
          letter-spacing: -0.01em;
        }
        .submit-btn:hover:not(:disabled) { background: #6366f1; }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Spinner */
        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .spinner { animation: none; opacity: 0.5; }
        }

        /* Footer */
        .footer-text {
          text-align: center;
          font-size: 13px;
          color: #52525b;
          margin-top: 20px;
        }
        .link {
          color: #818cf8;
          text-decoration: none;
          font-weight: 500;
        }
        .link:hover { text-decoration: underline; }

        /* Responsive */
        @media (max-width: 440px) {
          .card { padding: 28px 20px 24px; }
          .heading { font-size: 20px; }
        }
      `}</style>
    </div>
  );
}