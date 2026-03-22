"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Card, Form, Row, Col } from "react-bootstrap";

export default function LandingPage() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  const handleJoin = (e) => {
    e.preventDefault();
    if (roomId) router.push(`/jogar?room=${roomId.toUpperCase()}`);
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100 position-relative py-5">
      <Row className="w-100 justify-content-center align-items-center gap-5">
        <Col md={6} className="text-center text-md-start">
          <h1 style={{ fontSize: 'clamp(2.5rem, 5.5vw, 5rem)', fontFamily: 'var(--font-syncopate)', color: 'var(--primary)' }}>
            BINGO<br/><span className="text-white">PRO V2</span>
          </h1>
          <p className="mt-4 text-light fs-5 opacity-75" style={{ lineHeight: '1.6' }}>
            A plataforma premium definitiva para organizar o seu Bingo. 
            Suporte avançado para <strong>30, 75, 80 e 90 bolas</strong> integrado ao motor 
            automático com locução em voz dupla e cartelas sincronizadas num ritmo impecável.
          </p>
          <div className="d-flex gap-3 mt-5 flex-wrap justify-content-center justify-content-md-start">
            <button className="btn-cyber btn-primary-cyber fw-bold py-3 px-5 rounded-3 fs-5" onClick={() => router.push('/admin')}>
              ENTRADA ORGANIZADOR
            </button>
          </div>
        </Col>

        <Col md={5}>
          <Card className="cyber-panel border-0 w-100" style={{ maxWidth: '400px', margin: '0 auto', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <Card.Body className="p-4 p-sm-5 text-center">
              <h3 className="mb-4 text-light fw-bold" style={{ fontFamily: 'var(--font-syncopate)' }}>
                SOU JOGADOR
              </h3>
              <p className="text-light opacity-75 mb-4">
                Escaneie o QR Code no telão ou digite o passe de acesso para gerar sua Cartela Mágica em tempo real:
              </p>
              <Form onSubmit={handleJoin}>
                <Form.Group className="mb-4 text-start">
                  <Form.Label className="text-info fw-bold small">CÓDIGO DA SALA</Form.Label>
                  <Form.Control type="text" placeholder="Ex: ABCDEF" value={roomId} onChange={e => setRoomId(e.target.value.toUpperCase())} required 
                    style={{ background: 'var(--glass-bg)', color: 'white', border: '1px solid var(--primary)', fontSize: '1.4rem', padding: '14px', letterSpacing: '4px', fontWeight: 'bold', textAlign: 'center' }} />
                </Form.Group>
                <button type="submit" className="btn-cyber bg-transparent border-info text-info rounded-3 w-100 py-3 fw-bold" style={{ fontSize: '1.1rem' }}>
                  GERAR MINHA CARTELA
                </button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="mt-5 pt-5 text-center text-light opacity-50 small w-100 position-absolute bottom-0 mb-3" style={{ fontFamily: 'var(--font-syncopate)' }}>
        © 2026 BINGO PRO | FUTURISTIC EDITION
      </div>
    </Container>
  );
}
