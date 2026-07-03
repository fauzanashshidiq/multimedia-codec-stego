import React from "react";

const Dashboard = () => {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          Selamat Datang di <span className="text-gradient">Media Harbor</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
          Platform Codec & Steganografi untuk UAS Projek Sistem Multimedia.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        <div className="glass-card">
          <h2
            style={{
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span style={{ color: "var(--accent-primary)" }}>🖼️</span> Image
            Studio
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
            Kompresi gambar untuk menghemat ukuran dan sisipkan pesan rahasia ke
            dalam pixel gambar dengan teknik LSB (Least Significant Bit).
          </p>
        </div>

        <div className="glass-card">
          <h2
            style={{
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span style={{ color: "var(--accent-secondary)" }}>🎵</span> Audio
            Studio
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
            Olahan data audio tingkat lanjut. Kompresi file suara Anda dan
            sembunyikan informasi sensitif di dalam gelombang suara.
          </p>
        </div>

        <div className="glass-card">
          <h2
            style={{
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span style={{ color: "#ec4899" }}>🎥</span> Video Studio
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
            Sistem canggih pemrosesan video di browser menggunakan FFmpeg.wasm.
            Turunkan bitrate video atau sisipkan pesan rahasia.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
