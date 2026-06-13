export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      background: "#0a0a0a",
      color: "#f4f4f5",
      fontFamily: "sans-serif",
      textAlign: "center",
      padding: "24px",
    }}>
      <h1 style={{ fontSize: "28px", fontWeight: 600 }}>Link not found</h1>
      <p style={{ color: "#71717a", fontSize: "14px" }}>
        This short link doesn't exist or has been removed.
      </p>
      <a href="/" style={{ color: "#818cf8", fontSize: "14px", marginTop: "8px" }}>
        Go to LinkVault →
      </a>
    </div>
  );
}