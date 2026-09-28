"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>AwardPair hit an unexpected error</h1>
        <p style={{ maxWidth: "28rem", color: "#666" }}>
          The application failed to load. Please try again — if this keeps happening, come back later.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            height: "2.75rem",
            padding: "0 1.5rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "#111",
            color: "#fff",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
