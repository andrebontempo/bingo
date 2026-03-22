"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Card, Form, Alert } from "react-bootstrap";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAuth = async (e) => {
    e.preventDefault();
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
        setError(data.message || "Authentication failed");
      }
    } catch (err) {
      setError("Network or server unavailable.");
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Card className="cyber-panel w-100 border-0" style={{ maxWidth: '400px' }}>
        <Card.Body className="p-4 text-center">
          <div className="logo mb-4">
            <h2 style={{ fontFamily: 'var(--font-syncopate)', color: 'var(--primary)' }}>Admin V2</h2>
          </div>
          {error && <Alert variant="danger" className="bg-transparent border-danger text-danger mb-4 py-2 text-sm">{error}</Alert>}
          <Form onSubmit={handleAuth}>
            <Form.Group className="mb-4 text-start">
              <Form.Label className="text-light small fw-bold">E-mail</Form.Label>
              <Form.Control type="email" value={email} onChange={e=>setEmail(e.target.value)} required 
                style={{ background: 'var(--glass-bg)', color: 'white', border: '1px solid var(--primary)', padding: '12px' }} />
            </Form.Group>
            <Form.Group className="mb-5 text-start">
              <Form.Label className="text-light small fw-bold">Senha</Form.Label>
              <Form.Control type="password" value={password} onChange={e=>setPassword(e.target.value)} required 
                style={{ background: 'var(--glass-bg)', color: 'white', border: '1px solid var(--primary)', padding: '12px' }} />
            </Form.Group>
            <button type="submit" className="btn-cyber btn-primary-cyber w-100 py-3 mb-4">
              {isRegister ? "Registrar e Entrar" : "Entrar Setup"}
            </button>
          </Form>
          <div className="text-info small fw-bold mt-2" style={{ cursor: 'pointer' }} onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Já possui login? Clique aqui." : "Primeiro acesso? Crie um aqui."}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
