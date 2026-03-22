"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SuperAdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Credenciais inválidas.");
        return;
      }

      if (data.role !== "superadmin") {
        setError("Acesso negado. Apenas Super Admins podem entrar aqui.");
        return;
      }

      localStorage.setItem("superAdminData", JSON.stringify(data));
      router.push("/superadmin/dashboard");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "var(--bg-dark)" }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "24px",
          padding: "2.5rem",
          boxShadow: "0 0 40px rgba(239,68,68,0.1)",
        }}
      >
        <div className="text-center mb-4">
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🛡️</div>
          <h1
            className="text-light fw-bold mb-1"
            style={{ fontFamily: "var(--font-syncopate)", fontSize: "1rem", letterSpacing: "3px" }}
          >
            SUPER ADMIN
          </h1>
          <p className="text-white opacity-40 small mb-0">Área restrita — Bingo V2 Pro</p>
        </div>

        <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
          <div>
            <label className="text-white opacity-60 small mb-1 d-block">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-100 rounded-3 px-3 py-2 text-white"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(239,68,68,0.3)",
                outline: "none",
                fontSize: "0.95rem",
              }}
            />
          </div>
          <div>
            <label className="text-white opacity-60 small mb-1 d-block">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-100 rounded-3 px-3 py-2 text-white"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(239,68,68,0.3)",
                outline: "none",
                fontSize: "0.95rem",
              }}
            />
          </div>

          {error && (
            <div
              className="rounded-3 px-3 py-2 small text-center"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-100 fw-bold rounded-3 py-3 mt-1"
            style={{
              background: loading ? "rgba(239,68,68,0.3)" : "rgba(239,68,68,0.8)",
              border: "none",
              color: "white",
              fontSize: "0.95rem",
              letterSpacing: "2px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {loading ? "AUTENTICANDO..." : "🔐 ENTRAR"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => router.push("/")}
            className="btn btn-link text-white opacity-30 small p-0"
            style={{ fontSize: "0.75rem" }}
          >
            ← Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}
