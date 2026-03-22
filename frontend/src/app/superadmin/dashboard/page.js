"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Spinner } from "react-bootstrap";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [superAdmin, setSuperAdmin] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(null);
  const [activeTab, setActiveTab] = useState("rooms");
  const [lastRefresh, setLastRefresh] = useState(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // Auth guard
  useEffect(() => {
    const stored = localStorage.getItem("superAdminData");
    if (!stored) { router.push("/superadmin"); return; }
    const data = JSON.parse(stored);
    if (data.role !== "superadmin") { router.push("/superadmin"); return; }
    setSuperAdmin(data);
  }, [router]);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/api/rooms/active`);
      setRooms(await res.json());
      setLastRefresh(new Date().toLocaleTimeString("pt-BR"));
    } catch (err) { console.error(err); }
  }, [baseUrl]);

  const fetchAdmins = useCallback(async () => {
    if (!superAdmin?.token) return;
    try {
      const res = await fetch(`${baseUrl}/api/auth/all`, {
        headers: { Authorization: `Bearer ${superAdmin.token}` },
      });
      setAdmins(await res.json());
    } catch (err) { console.error(err); }
  }, [baseUrl, superAdmin]);

  useEffect(() => {
    if (!superAdmin) return;
    Promise.all([fetchRooms(), fetchAdmins()]).finally(() => setLoading(false));
  }, [superAdmin, fetchRooms, fetchAdmins]);

  const closeRoom = async (roomId) => {
    if (!confirm(`Fechar a sala ${roomId}? Esta ação não pode ser desfeita.`)) return;
    setClosing(roomId);
    try {
      await fetch(`${baseUrl}/api/rooms/${roomId}`, { method: "DELETE" });
      setRooms(prev => prev.filter(r => r.roomId !== roomId));
    } catch (err) { alert("Erro: " + err.message); }
    finally { setClosing(null); }
  };

  const refresh = () => {
    setLoading(true);
    Promise.all([fetchRooms(), fetchAdmins()]).finally(() => setLoading(false));
  };

  const logout = () => {
    localStorage.removeItem("superAdminData");
    router.push("/superadmin");
  };

  const stats = [
    { label: "Salas Ativas", value: rooms.length, color: "#0ea5e9" },
    { label: "Em Jogo", value: rooms.filter(r => r.status === "playing").length, color: "#22c55e" },
    { label: "Jogadores Online", value: rooms.reduce((a, r) => a + (r.players?.length || 0), 0), color: "#f59e0b" },
    { label: "Organizadores", value: admins.filter(a => a.role === "admin").length, color: "#a855f7" },
  ];

  return (
    <div className="min-vh-100" style={{ background: "var(--bg-dark)", color: "white" }}>
      <Container fluid="lg" className="py-4 py-md-5">

        {/* ─── HEADER ─── */}
        <header
          className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-5 pb-4"
          style={{ borderBottom: "1px solid rgba(239,68,68,0.2)" }}
        >
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span style={{ fontSize: "1.4rem" }}>🛡️</span>
              <h1 className="mb-0 text-light fw-bold" style={{ fontSize: "clamp(1.2rem, 3.5vw, 1.8rem)", letterSpacing: "1px" }}>
                SUPER ADMIN
              </h1>
              <span
                className="badge ms-1"
                style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", fontSize: "0.6rem" }}
              >
                ACESSO TOTAL
              </span>
            </div>
            <p className="mb-0 text-white opacity-40 small">
              {superAdmin?.email} &nbsp;·&nbsp;
              {lastRefresh && <>Atualizado: {lastRefresh}</>}
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-outline-secondary btn-sm fw-bold px-3" onClick={refresh}>🔄</button>
            <button className="btn btn-outline-danger btn-sm fw-bold px-3" onClick={logout}>⏻ SAIR</button>
          </div>
        </header>

        {/* ─── STATS ─── */}
        <Row className="g-3 mb-4">
          {stats.map((s, i) => (
            <Col xs={6} md={3} key={i}>
              <div className="text-center p-3 rounded-3" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${s.color}33` }}>
                <div className="fw-bold" style={{ fontSize: "clamp(1.8rem, 5vw, 2.4rem)", color: s.color }}>
                  {loading ? "—" : s.value}
                </div>
                <div className="text-white opacity-40 small mt-1" style={{ fontFamily: "var(--font-syncopate)", fontSize: "0.6rem" }}>
                  {s.label}
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* ─── TABS ─── */}
        <div className="d-flex gap-2 mb-4">
          {[{ id: "rooms", label: "🏠 Salas Ativas" }, { id: "admins", label: "👤 Organizadores" }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn btn-sm fw-bold px-4 py-2"
              style={{
                background: activeTab === tab.id ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${activeTab === tab.id ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`,
                color: activeTab === tab.id ? "#ef4444" : "rgba(255,255,255,0.5)",
                borderRadius: "10px",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── CONTEÚDO ─── */}
        <div className="cyber-panel p-4" style={{ borderRadius: "24px", border: "1px solid rgba(239,68,68,0.15)" }}>

          {/* TAB: SALAS */}
          {activeTab === "rooms" && (
            <>
              <h2 className="text-light fw-bold mb-4" style={{ fontFamily: "var(--font-syncopate)", fontSize: "0.85rem", opacity: 0.6 }}>
                TODAS AS SALAS ATIVAS
              </h2>
              {loading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>
              ) : rooms.length === 0 ? (
                <div className="text-center py-5 opacity-25">
                  <p className="fs-1">✅</p>
                  <p className="small">Nenhuma sala ativa.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="w-100" style={{ borderCollapse: "separate", borderSpacing: "0 8px" }}>
                    <thead>
                      <tr className="text-white opacity-40 small" style={{ fontFamily: "var(--font-syncopate)", fontSize: "0.6rem" }}>
                        <th className="pb-2 ps-3">CÓDIGO</th>
                        <th className="pb-2">ORGANIZADOR</th>
                        <th className="pb-2">MODO</th>
                        <th className="pb-2">JOGADORES</th>
                        <th className="pb-2">STATUS</th>
                        <th className="pb-2 text-end pe-3">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map(room => (
                        <tr key={room.roomId} style={{ background: "rgba(255,255,255,0.03)" }}>
                          <td className="py-3 ps-3 rounded-start-3">
                            <span className="fw-bold text-info" style={{ fontFamily: "monospace", fontSize: "1.1rem", letterSpacing: "2px" }}>
                              {room.roomId}
                            </span>
                          </td>
                          <td className="py-3 text-white opacity-75" style={{ textTransform: "capitalize" }}>
                            {room.adminName || "—"}
                          </td>
                          <td className="py-3">
                            <span className="badge" style={{ background: "rgba(14,165,233,0.15)", color: "#0ea5e9", border: "1px solid #0ea5e930" }}>
                              {room.gameMode} bolas
                            </span>
                          </td>
                          <td className="py-3 text-white opacity-75">👤 {room.players?.length || 0}</td>
                          <td className="py-3">
                            <span className="small fw-bold" style={{ color: room.status === "playing" ? "#22c55e" : "#f59e0b" }}>
                              {room.status === "playing" ? "● EM JOGO" : "● AGUARDANDO"}
                            </span>
                          </td>
                          <td className="py-3 pe-3 rounded-end-3 text-end">
                            <button
                              className="btn btn-sm btn-outline-danger fw-bold"
                              style={{ fontSize: "0.75rem" }}
                              disabled={closing === room.roomId}
                              onClick={() => closeRoom(room.roomId)}
                            >
                              {closing === room.roomId ? <Spinner animation="border" size="sm" /> : "✕ FECHAR"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* TAB: ORGANIZADORES */}
          {activeTab === "admins" && (
            <>
              <h2 className="text-light fw-bold mb-4" style={{ fontFamily: "var(--font-syncopate)", fontSize: "0.85rem", opacity: 0.6 }}>
                ORGANIZADORES CADASTRADOS
              </h2>
              {loading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>
              ) : admins.length === 0 ? (
                <div className="text-center py-5 opacity-25">
                  <p className="small">Nenhum organizador encontrado.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {admins.map(a => (
                    <div key={a._id} className="d-flex justify-content-between align-items-center p-3 rounded-3"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div>
                        <div className="text-white fw-bold small" style={{ textTransform: "capitalize" }}>
                          {a.email.split("@")[0].replace(".", " ")}
                        </div>
                        <div className="text-white opacity-40" style={{ fontSize: "0.75rem" }}>{a.email}</div>
                      </div>
                      <span
                        className="badge"
                        style={{
                          background: a.role === "superadmin" ? "rgba(239,68,68,0.15)" : "rgba(14,165,233,0.15)",
                          color: a.role === "superadmin" ? "#ef4444" : "#0ea5e9",
                          border: `1px solid ${a.role === "superadmin" ? "rgba(239,68,68,0.3)" : "rgba(14,165,233,0.3)"}`,
                          fontSize: "0.65rem",
                        }}
                      >
                        {a.role === "superadmin" ? "🛡️ SUPER ADMIN" : "🎱 ORGANIZADOR"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-center text-white opacity-20 small mt-4">
          Fechar uma sala remove permanentemente todos os dados associados.
        </p>
      </Container>
    </div>
  );
}
