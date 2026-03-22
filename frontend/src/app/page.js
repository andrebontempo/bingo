"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Card, Row, Col, Badge, Spinner } from "react-bootstrap";

export default function LandingPage() {
  const [activeRooms, setActiveRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        setLoading(false);
      }
    };
    fetchRooms();
    const interval = setInterval(fetchRooms, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  const handleJoin = (rid) => {
    router.push(`/jogar?room=${rid}`);
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100 py-5">
      <Row className="w-100 justify-content-center align-items-center g-5">
        <Col lg={5} className="text-center text-lg-start">
          <h1 className="fw-bold mb-3" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontFamily: 'var(--font-syncopate)', color: 'var(--primary)', lineHeight: '1.0' }}>
            BINGO<br/><span className="text-white">V2 PRO</span>
          </h1>
          <p className="text-light opacity-75 fs-5 mb-5" style={{ maxWidth: '400px', margin: '0 auto 2rem' }}>
            Sua experiência definitiva em Bingos Digitais. Salas automáticas, vozes reais e segurança total.
          </p>
          <button className="btn-cyber btn-primary-cyber px-5 py-4 w-100 shadow-lg" style={{ fontSize: '1.2rem'}} onClick={() => router.push('/admin')}>
             PAINEL DO ORGANIZADOR 🛠️
          </button>
        </Col>

        <Col lg={6}>
          <div className="cyber-panel p-4 p-md-5 w-100" style={{ minHeight: '400px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '32px' }}>
            <h3 className="text-light fw-bold mb-4 d-flex justify-content-between align-items-center" style={{ fontFamily: 'var(--font-syncopate)', fontSize: '1.1rem', letterSpacing: '1px' }}>
              SALAS DISPONÍVEIS 
              {loading && <Spinner animation="border" size="sm" variant="info" />}
            </h3>
            
            <div className="d-flex flex-column gap-3" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {activeRooms.length > 0 ? (
                activeRooms.map((room) => (
                  <div 
                    key={room.roomId} 
                    onClick={() => handleJoin(room.roomId)}
                    className="p-4 border rounded-4 d-flex justify-content-between align-items-center transition-all hover-scale"
                    style={{ 
                      cursor: 'pointer', 
                      background: 'var(--glass-bg)', 
                      borderColor: 'rgba(255,255,255,0.1)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                  >
                    <div>
                      <h5 className="text-white m-0 fw-bold" style={{ fontSize: '1.1rem' }}>BINGO DO {room.adminName.toUpperCase()}</h5>
                      <p className="text-info small m-0 opacity-75 fw-bold">{room.gameMode} BOLAS • {room.players?.length || 0} JOGADORES</p>
                    </div>
                    <div className="text-end">
                      <Badge bg="dark" className="border border-info text-info mb-2 px-3 py-2" style={{ fontSize: '0.8rem' }}>SALA: {room.roomId}</Badge>
                      <div className="text-accent small fw-bold">ENTRAR →</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5 opacity-50">
                   {!loading && (
                     <>
                        <p className="fs-1">🎱</p>
                        <p className="fw-bold text-light">Nenhuma sala aberta no momento.</p>
                        <p className="small">Fique de olho! Assim que um organizador abrir uma sala ela aparecerá aqui instantaneamente.</p>
                     </>
                   )}
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>
      
      <div className="mt-5 text-center text-light opacity-25 small" style={{ fontFamily: 'monospace' }}>
        © 2026 BINGO V2 PRO • FUTURISTIC EDITION
      </div>
    </Container>
  );
}
