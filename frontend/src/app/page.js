"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Badge, Spinner, Form, Alert } from "react-bootstrap";

export default function LandingPage() {
  // --- JOGADOR STATE ---
  const [activeRooms, setActiveRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  
  // --- ORGANIZADOR STATE ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(false);

  const router = useRouter();

  // Fetch salas ativas
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/rooms/active`);
        if (res.ok) {
          const data = await res.json();
          setActiveRooms(data);
        }
      } catch (e) {
        console.error("Erro ao carregar salas:", e);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
    const interval = setInterval(fetchRooms, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleJoin = (rid) => {
    router.push(`/jogar?room=${rid}`);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoadingAuth(true);
    setError("");
    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("adminData", JSON.stringify(data));
        router.push("/admin/dashboard");
      } else {
        setError(data.message || "Erro de autenticação");
      }
    } catch (err) {
      setError("Servidor indisponível no momento.");
    } finally {
      setLoadingAuth(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: 'var(--bg-dark)', color: 'white' }}>
      {/* HEADER SECTION */}
      <header className="py-5 text-center">
        <h1 className="mb-2" style={{ 
          fontSize: 'clamp(2rem, 5vw, 3.8rem)', 
          fontFamily: 'var(--font-syncopate)', 
          fontWeight: '300', // Sem Negrito
          letterSpacing: '8px',
          color: 'var(--primary)',
          textShadow: '0 0 20px rgba(14, 165, 233, 0.3)'
        }}>
          BINGO <span className="text-white">V2 PRO</span>
        </h1>
        <p className="opacity-50 small text-uppercase" style={{ letterSpacing: '4px' }}>Futuristic Gaming Engine</p>
      </header>

      <Container className="flex-grow-1 mb-5">
        <Row className="g-5">
          {/* LADO JOGADOR: DESCOBERTA DE SALAS */}
          <Col lg={7}>
            <div className="cyber-panel p-4 p-md-5 h-100" style={{ minHeight: '500px' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0" style={{ fontFamily: 'var(--font-syncopate)', fontSize: '1.2rem' }}>
                  SALAS <span className="text-info">ABERTAS</span> 🕹️
                </h3>
                {loadingRooms && <Spinner animation="border" size="sm" variant="info" />}
              </div>

              <div className="d-flex flex-column gap-3 overflow-auto pr-2" style={{ maxHeight: '550px' }}>
                {activeRooms.length > 0 ? (
                  activeRooms.map((room) => (
                    <div 
                      key={room.roomId} 
                      onClick={() => handleJoin(room.roomId)}
                      className="p-4 border d-flex justify-content-between align-items-center transition-all hover-scale"
                      style={{ 
                        cursor: 'pointer', 
                        background: 'rgba(255,255,255,0.03)', 
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderRadius: '20px'
                      }}
                    >
                      <div>
                        <h5 className="text-white m-0 fw-bold">BINGO DO {room.adminName.toUpperCase()}</h5>
                        <div className="d-flex gap-2 mt-1">
                          <span className="text-info small opacity-75">{room.gameMode} BOLAS</span>
                          <span className="text-light opacity-25 small">•</span>
                          <span className="text-light opacity-50 small">{room.players?.length || 0} JOGADORES</span>
                        </div>
                      </div>
                      <div className="text-end">
                        <Badge bg="dark" className="border border-info text-info mb-2 px-3 py-2 rounded-3" style={{ fontSize: '0.8rem' }}>#{room.roomId}</Badge>
                        <div className="text-accent small fw-bold" style={{ fontSize: '0.7rem' }}>CLIQUE PARA ENTRAR →</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5">
                     {!loadingRooms && (
                       <div className="opacity-25 py-5">
                          <p className="fs-1 mb-0">🎱</p>
                          <p className="fw-bold mt-2">SISTEMA AGUARDANDO NOVAS SALAS...</p>
                          <p className="small mx-auto" style={{ maxWidth: '300px' }}>Assim que um organizador iniciar um Bingo, a sala aparecerá aqui instantaneamente.</p>
                       </div>
                     )}
                  </div>
                )}
              </div>
            </div>
          </Col>

          {/* LADO ORGANIZADOR: LOGIN INTEGRADO */}
          <Col lg={5}>
            <div className="cyber-panel p-4 p-md-5 h-100 position-relative overflow-hidden" 
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '32px' }}>
              
              {/* IMAGE ELEMENT */}
              <div className="mb-4 rounded-4 overflow-hidden border border-secondary border-opacity-25" style={{ height: '140px' }}>
                 <img src="/bingo_futuristic_bg.png" alt="Bingo Art" className="w-100 h-100 object-fit-cover opacity-75" />
              </div>

              <h3 className="text-light fw-bold mb-3" style={{ fontFamily: 'var(--font-syncopate)', fontSize: '1rem' }}>
                ÁREA DO ORGANIZADOR 🛠️
              </h3>
              <p className="text-light opacity-50 small mb-4">Autentique-se para gerenciar suas salas, sorteios e jogadores.</p>

              {error && <Alert variant="danger" className="bg-transparent border-danger text-danger py-2 small">{error}</Alert>}

              <Form onSubmit={handleAuth}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-info small fw-bold opacity-75">SISTEMA E-MAIL</Form.Label>
                  <Form.Control type="email" value={email} onChange={e=>setEmail(e.target.value)} required 
                    placeholder="organizador@bingov2.com"
                    style={{ background: 'var(--glass-bg)', color: 'white', border: '1px solid var(--border)', padding: '12px' }} />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label className="text-info small fw-bold opacity-75">PASSE DE SEGURANÇA</Form.Label>
                  <Form.Control type="password" value={password} onChange={e=>setPassword(e.target.value)} required 
                    placeholder="••••••••"
                    style={{ background: 'var(--glass-bg)', color: 'white', border: '1px solid var(--border)', padding: '12px' }} />
                </Form.Group>

                <button type="submit" disabled={loadingAuth} className="btn-cyber btn-primary-cyber w-100 py-3 shadow-lg fw-bold rounded-4">
                  {loadingAuth ? <Spinner animation="border" size="sm" /> : (isRegister ? "CRIAR CONTA E ACESSAR" : "ENTRAR NO SETUP")}
                </button>
              </Form>

              <div className="text-center mt-4">
                <span className="text-light opacity-50 small">
                  {isRegister ? "Já possui conta?" : "Não tem conta ainda?"}
                </span>
                <span className="text-info small fw-bold ms-2 cursor-pointer" onClick={() => setIsRegister(!isRegister)} style={{ cursor: 'pointer' }}>
                  {isRegister ? "Fazer Login" : "Registrar-se"}
                </span>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      
      <footer className="py-4 text-center opacity-25" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
        © 2026 BINGO V2 PRO • SYNCED & SECURE ENGINE
      </footer>

      <style jsx>{`
        .cursor-pointer { cursor: pointer; }
        .hover-scale:hover {
          transform: scale(1.02);
          background: rgba(14, 165, 233, 0.05) !important;
          border-color: rgba(14, 165, 233, 0.3) !important;
          box-shadow: 0 0 20px rgba(14, 165, 233, 0.1);
        }
      `}</style>
    </div>
  );
}
