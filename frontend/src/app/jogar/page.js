"use client";
import { useState, useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { Container, Card, Form, Alert } from "react-bootstrap";

export default function PlayerHome() {
  const socket = useSocket();
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [lastDrawn, setLastDrawn] = useState(null);
  const [cartela, setCartela] = useState([]);
  const [marked, setMarked] = useState([]);

  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    let id = localStorage.getItem("bingo_device_id");
    if (!id) {
      id = Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem("bingo_device_id", id);
    }
    setDeviceId(id);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');
    if (roomFromUrl) setRoomId(roomFromUrl);

    if (socket) {
      socket.on('number_drawn', (data) => {
        setLastDrawn(data.display || data.number);
      });
      socket.on('game_started', () => {
        setLastDrawn(null);
        setMarked([]);
      });
      socket.on('room_closed', () => {
        alert("A sala atual foi encerrada pelo Administrador.");
        window.location.href = '/'; 
      });
    }
    return () => {
      if (socket) {
        socket.off('number_drawn');
        socket.off('game_started');
        socket.off('room_closed');
      }
    };
  }, [socket]);

  const joinGame = async (e) => {
    e.preventDefault();
    if (!roomId || !name || !deviceId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/rooms/${roomId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, deviceId })
      });
      
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Erro ao entrar na sala");
        return;
      }

      setCartela(data.card);
      setName(data.name); 

      if (socket) {
        socket.emit('join_room', { roomId, playerName: data.name });
        setJoined(true);
      }
    } catch(err) {
      console.log(err);
      alert("Servidor indisponível no momento.");
    }
  };

  const toggleMark = (num) => {
    setMarked(prev => prev.includes(num) ? prev.filter(n=>n!==num) : [...prev, num]);
  };

  if (joined) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100 py-3">
        <h2 className="mb-4 text-center" style={{ fontFamily: 'var(--font-syncopate)', color: 'var(--primary)', letterSpacing: '2px' }}>
          SALA - {roomId}
        </h2>
        
        <div className="d-flex align-items-center justify-content-between bg-dark border shadow-sm rounded-4 w-100 px-4 py-2 mb-4" style={{ maxWidth: '420px', borderColor: 'rgba(255,255,255,0.1)' }}>
          <span className="text-light opacity-75 small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>ÚLTIMA BOLA:</span>
          <div className="number-display pop m-0" style={{ fontSize: '2.4rem', color: 'var(--accent)', textShadow: '0 0 10px rgba(14,165,233,0.3)', minHeight: '40px' }}>
             {lastDrawn ? lastDrawn : <span style={{ fontSize: '1rem', whiteSpace: 'nowrap', letterSpacing: '2px', color: 'var(--text-muted)' }}>AGUARDE</span>}
          </div>
        </div>

        <Card className="cyber-panel w-100 border-0" style={{ maxWidth: '420px' }}>
          <Card.Body className="p-sm-4 p-2">
            <h4 className="text-center mb-3 text-light">Cartela de <span style={{ color: 'var(--accent)' }}>{name}</span></h4>
            
            <div className="board-glass p-2 mb-4 mx-auto w-100" style={{ borderRadius: '12px', overflowX: 'hidden' }}>
              <table className="w-100 text-center m-0 p-0" style={{ tableLayout: 'fixed', borderSpacing: '4px', borderCollapse: 'separate' }}>
                <thead>
                  <tr>
                    {["B", "I", "N", "G", "O"].map(letter => (
                      <th key={letter} className="fs-5 pb-2 text-primary" style={{ fontFamily: 'var(--font-syncopate)' }}>
                        {letter}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cartela.map((row, rIdx) => (
                     <tr key={rIdx}>
                       {row.map((cell, cIdx) => {
                         const isFree = cell === "FREE";
                         const isMarked = isFree || marked.includes(cell);
                         return (
                           <td key={cIdx} className="p-0">
                             <div 
                               onClick={() => !isFree && toggleMark(cell)}
                               className="d-flex align-items-center justify-content-center mx-auto"
                               style={{ 
                                 width: '100%', 
                                 aspectRatio: '1/1',
                                 fontSize: isFree ? '1rem' : 'clamp(0.9rem, 4vw, 1.3rem)', 
                                 fontWeight: 'bold', 
                                 borderRadius: '8px', 
                                 cursor: isFree ? 'default' : 'pointer',
                                 background: isMarked ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'var(--glass-bg)',
                                 color: isMarked ? '#fff' : 'var(--text-muted)',
                                 border: isMarked ? '2px solid var(--accent)' : '1px solid var(--border)',
                                 boxShadow: isMarked ? '0 0 10px rgba(14, 165, 233, 0.3)' : 'none',
                                 transition: 'all 0.2s',
                                 transform: isMarked ? 'scale(1.05)' : 'scale(1)'
                               }}>
                               {isFree ? "⭐" : cell}
                             </div>
                           </td>
                         )
                       })}
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="d-flex flex-sm-row flex-column gap-3 w-100">
              <button 
                className="btn-cyber btn-warning-cyber flex-grow-1 py-3 m-0 shadow-sm" 
                style={{ fontSize: '1.5rem', borderRadius: '12px' }} 
                onClick={() => socket && socket.emit('linha_called', { roomId, playerName: name, cardNumbers: cartela })}>
                LINHA!
              </button>
              <button 
                className="btn-cyber btn-primary-cyber flex-grow-1 py-3 m-0 shadow-sm" 
                style={{ fontSize: '1.5rem', borderRadius: '12px' }} 
                onClick={() => socket && socket.emit('bingo_called', { roomId, playerName: name, cardNumbers: cartela })}>
                BINGO!
              </button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100 position-relative">
      <div className="logo text-center mb-5 w-100">
        <h1 id="mainTitle" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>BINGO V2</h1>
        <p className="text-muted mt-2" style={{ fontFamily: 'var(--font-syncopate)', letterSpacing: '2px', fontSize: '0.8rem' }}>
          FUTURISTIC EDITION
        </p>
      </div>

      <Card className="cyber-panel w-100 border-0" style={{ maxWidth: '400px' }}>
        <Card.Body className="p-4">
          <Alert variant="info" className="bg-transparent border-info text-info rounded-3 mb-4 text-center" style={{ fontSize: '0.9rem' }}>
            Participe digitando o código da sala.
          </Alert>
          <Form onSubmit={joinGame}>
            <Form.Group className="mb-4">
              <Form.Label className="text-light fw-bold small">Código da Sala</Form.Label>
              <Form.Control type="text" placeholder="CÓDIGO" value={roomId} onChange={e => setRoomId(e.target.value.toUpperCase())} required 
                style={{ background: 'var(--glass-bg)', color: 'var(--accent)', border: '1px solid var(--border)', fontSize: '1.2rem', padding: '12px', letterSpacing: '2px', fontWeight: 'bold', textAlign: 'center' }} />
            </Form.Group>
            <Form.Group className="mb-5">
              <Form.Label className="text-light fw-bold small">Apelido</Form.Label>
              <Form.Control type="text" placeholder="Seu Nome" value={name} onChange={e => setName(e.target.value)} required 
                style={{ background: 'var(--glass-bg)', color: 'white', border: '1px solid var(--border)', fontSize: '1.1rem', padding: '12px', textAlign: 'center' }} />
            </Form.Group>
            <button type="submit" className="btn-cyber btn-primary-cyber w-100 py-3">
              ENTRAR
            </button>
          </Form>
        </Card.Body>
      </Card>

      {/* Link de administrador oculto para focar na tela do jogador */}
    </Container>
  );
}
