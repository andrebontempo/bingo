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
        <Row className="g-5 justify-content-center">
          {/* LADO ORGANIZADOR: LOGIN INTEGRADO (ESQUERDA / POSIÇÃO 2 NO CELULAR) */}
          <Col lg={5} className="order-2 order-lg-1">
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

          {/* LADO JOGADOR: BOTÃO SIMPLES (DIREITA / POSIÇÃO 3 NO CELULAR) */}
          <Col lg={5} className="order-3 order-lg-2">
            <div className="cyber-panel p-4 p-md-5 h-100 d-flex flex-column align-items-center justify-content-center text-center" 
              style={{ minHeight: '400px', background: 'var(--surface-opaque)', border: '1px solid var(--border)', borderStyle: 'dashed' }}>
              
              <div className="mb-4 fs-1 opacity-50">🎮</div>
              <h3 className="fw-bold mb-3" style={{ fontFamily: 'var(--font-syncopate)', fontSize: '1.2rem' }}>
                SOU <span className="text-info">JOGADOR</span>
              </h3>
              <p className="text-light opacity-50 mb-4" style={{ maxWidth: '300px' }}>
                Deseja participar de um Bingo? Explore as salas abertas e pegue sua cartela agora mesmo.
              </p>

              <button 
                onClick={() => router.push('/salas')}
                className="btn-cyber bg-transparent border-info text-info w-100 py-4 fs-5 fw-bold transition-all hover-glow"
                style={{ borderRadius: '24px', letterSpacing: '2px' }}
              >
                VER SALAS ABERTAS →
              </button>
              
              <p className="mt-4 small text-light opacity-25 fw-bold">ACESSO 100% DIGITAL</p>
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
