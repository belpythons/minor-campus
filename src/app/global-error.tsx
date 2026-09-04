"use client";

/**
 * Last-resort boundary: catches failures in the root layout itself, where the
 * app's providers are not available. Must render its own <html>/<body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: "#f4f7fa",
          color: "#1e293b",
          fontFamily: "-apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <div style={{ maxWidth: 460, textAlign: "center" }}>
          <h1 style={{ fontSize: 18, margin: "0 0 8px" }}>Aplikasi gagal dimuat</h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "#55677f", margin: "0 0 20px" }}>
            Terjadi kesalahan tak terduga. Muat ulang halaman untuk mencoba lagi.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: 0,
              background: "#0057a8",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Coba lagi
          </button>
          {error.digest && (
            <p style={{ marginTop: 16, fontSize: 11, color: "#7c8ba1", fontFamily: "monospace" }}>
              {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
